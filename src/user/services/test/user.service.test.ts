import { UserRepository } from "./../../repository/user.repository";
import { ITokenService, TokenService } from "./../token.service";
import { describe, expect, test } from "@jest/globals";
import { IUserService, UserService } from "../user.service";
import { User, UserDoc, UserModel } from "../../models/User.schema";
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
});
