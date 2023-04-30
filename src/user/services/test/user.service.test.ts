import { UserRepository } from "./../../repository/user.repository";
import { ITokenService, TokenService } from "./../token.service";
import { describe, expect, test } from "@jest/globals";
import { IUserService, UserService } from "../user.service";
import { STATUS_USER, User, UserDoc, UserModel } from "../../models/User.schema";
import { clearDB, closeDB } from "../../../helpers/testing";
import { PaginateModel } from "mongoose";
import tokenUtils from "./../../../utils/token";
import { StatusCodes } from "http-status-codes";
import { AppError } from "../../../utils/error";
import bcrypt from "bcrypt";

describe("UserService", () => {
  let repository: any;
  let userService: IUserService;
  let tokenService: ITokenService;
  beforeEach(async () => {
    await clearDB();
    repository = new UserRepository(UserModel);
    tokenService = new TokenService();
    userService = new UserService(repository, tokenService);
    jest.resetModules();
  });

  afterEach(async () => {
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    await closeDB();
  });

  describe("Register", () => {
    const payload = {
      email: "test@gmail.com",
    };

    test("Should create a new user and return it", async () => {
      const payload = {
        email: "succeed@gmail.com",
      };

      repository.findOne = jest.fn().mockReturnValueOnce(undefined);
      repository.create = jest.fn().mockReturnValueOnce({
        _id: "6164638f6c2b42fbbe2c13a2",
        email: "succeed@gmail.com",
        createPasswordSecret: "secret",
      });

      tokenService.createAuthToken = jest.fn().mockReturnValueOnce({
        publicKey: "public-key",
        privateKey: "private-key",
      });

      tokenService.createTokenPair = jest.fn().mockReturnValueOnce({
        accessToken: "access-token",
        refreshToken: "refresh-token",
      });

      const result = await userService.register(payload);
      expect(repository.findOne).toHaveBeenCalledWith({ email: "succeed@gmail.com" });
      expect(repository.create).toHaveBeenCalledWith({ ...payload, createPasswordSecret: expect.any(String) });
      expect(tokenService.createAuthToken).toHaveBeenCalledWith({
        userId: "6164638f6c2b42fbbe2c13a2",
        publicKey: expect.any(String),
        privateKey: expect.any(String),
      });
      expect(tokenService.createTokenPair).toHaveBeenCalledWith(
        { userId: "6164638f6c2b42fbbe2c13a2", email: "succeed@gmail.com" },
        expect.any(String),
        expect.any(String)
      );
      expect(result).toEqual({
        user: { email: "succeed@gmail.com" },
        tokens: { accessToken: "access-token", refreshToken: "refresh-token" },
      });
    });

    test("Should throw new an error if email is already exist", async () => {
      const email = "test@gmail.com";
      await repository.create({ email });

      await expect(userService.register(payload)).rejects.toEqual(Error("Email has already been used"));
    });

    test("Should throw an error if user creation fails", async () => {
      repository.create = jest.fn().mockReturnValueOnce(null);
      await expect(userService.register(payload)).rejects.toEqual(Error("Cannot create user"));
    });
  });

  describe("createLinkCreatePassword", () => {
    test("should create a link create password", () => {
      const user: User = {
        email: "test@email.com",
        createPasswordSecret: "private",
      };
      const linkCreatePassword = userService.createLinkCreatePassword(user);
      expect(linkCreatePassword).toBeDefined();
    });
  });

  describe("verifyCreatePasswordToken", () => {
    const token = "token";
    const createPasswordSecret = "createPasswordSecret";
    const email = "test@gmail.com";
    test("Verify create password token success", async () => {
      tokenUtils.verifyToken = jest
        .fn()
        .mockReturnValueOnce({
          token: "token",
        })
        .mockReturnValueOnce({
          email,
        });

      tokenUtils.decodeToken = jest.fn().mockReturnValueOnce({ email });
      repository.findOne = jest.fn().mockResolvedValueOnce({
        email,
        createPasswordSecret,
      });
      const result = await userService.verifyCreatePasswordToken(token);

      expect(repository.findOne).toHaveBeenCalledWith({ email });
      expect(tokenUtils.verifyToken).toHaveBeenCalledWith(token, process.env.CREATE_PASSWORD_SECRET);
      expect(tokenUtils.decodeToken).toHaveBeenCalledWith(token);
      expect(result).toEqual({ email, createPasswordSecret });
    });

    test("Verify create password token fails", async () => {
      tokenUtils.verifyToken = jest.fn().mockImplementation(() => {
        throw new AppError(StatusCodes.BAD_REQUEST, "Token invalid");
      });
      await expect(userService.verifyCreatePasswordToken).rejects.toEqual(Error("Token invalid"));
    });
  });

  describe("Create Password", () => {
    const payload = {
      token: "token",
      password: "password",
    };
    it("should create password for user with valid token", async () => {
      const mockUser = await repository.create({ email: "test@example.com" });
      userService.verifyCreatePasswordToken = jest.fn().mockResolvedValueOnce(mockUser);

      const user = await userService.createPassword(payload);

      expect(userService.verifyCreatePasswordToken).toHaveBeenCalledTimes(1);
      expect(userService.verifyCreatePasswordToken).toHaveBeenCalledWith(payload.token);

      expect(bcrypt.compareSync(payload.password, mockUser.password)).toBe(true);

      expect(user.password).toEqual(mockUser.password);
    });

    it("should throw AppError with BAD_REQUEST status when token is invalid", async () => {
      userService.verifyCreatePasswordToken = jest.fn().mockResolvedValueOnce(null);

      await expect(userService.createPassword(payload)).rejects.toEqual(Error("Token invalid"));

      expect(userService.verifyCreatePasswordToken).toHaveBeenCalledTimes(1);
      expect(userService.verifyCreatePasswordToken).toHaveBeenCalledWith(payload.token);
    });
  });

  describe("Update User", () => {
    const payload = {
      fullName: "PhamQuoc",
      mobile: "0123456789",
      title: "FullStack",
      memo: "I'm ",
    };
    const email = "user@example.com";
    it("should update success", async () => {
      const mockUser = await repository.create({ email, status: STATUS_USER.VERIFIED });

      await userService.updateUser(mockUser._id, payload);

      const user = await repository.findOne({ email });

      expect(user.fullName).toEqual(payload.fullName);
      expect(user.mobile).toEqual(payload.mobile);
      expect(user.title).toEqual(payload.title);
    });

    it("should update error user not found", async () => {
      const userId = "6164638f6c2b42fbbe2c13a2";
      await expect(userService.updateUser(userId, payload)).rejects.toThrow(Error("Not found user"));
    });
  });

  describe("Get profile", () => {
    const email = "user@example.com";
    const userId = "6164638f6c2b42fbbe2c13a2";
    it("should return profile", async () => {
      repository.findOne = jest.fn().mockReturnValueOnce({ _id: userId, email });

      const user = await userService.getProfileUser(userId);

      expect(user.email).toEqual(email);
      expect(user._id).toEqual(userId);
    });

    it("should return profile", async () => {
      const userId = "6164638f6c2b42fbbe2c13a2";
      await expect(userService.getProfileUser(userId)).rejects.toThrow(Error("Not found user"));
    });
  });

  describe("Login", () => {
    const payload = {
      email: "user@example.com",
      password: "password",
    };

    const user = {
      _id: "6164638f6c2b42fbbe2c13a2",
      email: "user@example.com",
      password: "password",
    };

    const tokenPair = {
      accessToken: "access-token",
      refreshToken: "refresh-token",
    };
    it("Login Success", async () => {
      repository.findOne = jest.fn().mockReturnValueOnce(user);
      bcrypt.compareSync = jest.fn().mockReturnValueOnce(true);
      tokenService.createAuthToken = jest.fn().mockReturnValueOnce(true);
      tokenService.createTokenPair = jest.fn().mockReturnValueOnce(tokenPair);

      const result = await userService.login(payload);

      expect(repository.findOne).toHaveBeenCalledWith({ email: payload.email });
      expect(bcrypt.compareSync).toHaveBeenCalledWith(payload.password, user.password);
      expect(result).toEqual(tokenPair);
    });

    it("Incorrect Email", async () => {
      repository.findOne = jest.fn().mockReturnValueOnce(undefined);
      await expect(userService.login(payload)).rejects.toThrow(Error("Email or password is incorrect"));
    });
    it("Incorrect Password", async () => {
      repository.findOne = jest.fn().mockReturnValueOnce(user);
      bcrypt.compareSync = jest.fn().mockReturnValueOnce(false);
      await expect(userService.login(payload)).rejects.toThrow(Error("Email or password is incorrect"));
    });
    it("Can't create token", async () => {
      repository.findOne = jest.fn().mockReturnValueOnce(user);
      bcrypt.compareSync = jest.fn().mockReturnValueOnce(true);
      tokenService.createAuthToken = jest.fn().mockReturnValueOnce(false);

      await expect(userService.login(payload)).rejects.toThrow(Error("Can't create token"));
    });
  });

  describe("Logout", () => {
    const userId = "6164638f6c2b42fbbe2c13a2";
    it("should log out", async () => {
      tokenService.deleteTokenByUserId = jest.fn().mockReturnValueOnce(true);
      await userService.logout(userId);
      expect(tokenService.deleteTokenByUserId).toBeCalledTimes(1);
      expect(tokenService.deleteTokenByUserId).toHaveBeenCalledWith(userId);
    });
  });
});
