import crypto from "crypto";
import _ from "lodash";
import bcrypt from "bcrypt";
require("dotenv").config();

import tokenUtils from "./../../utils/token";
import { ITokenService } from "./token.service";
import { StatusCodes } from "http-status-codes";
import { AppError } from "./../../utils/error";
import { User, UserDoc } from "./../models/User.schema";
import { RegisterInput, RegisterOutput, CreatePasswordInput, UpdateInformationInput } from "./../types/user.type";
import { PaginateModel } from "mongoose";

export interface IUserService {
  register(payload: RegisterInput): Promise<RegisterOutput>;
  verifyCreatePasswordToken(payload: string): Promise<User>;
  createLinkCreatePassword(payload: User): string;
  createPassword(payload: CreatePasswordInput): Promise<User>;
  updateUser(payload: UpdateInformationInput): Promise<void>;
}

export class UserService implements IUserService {
  private repository: PaginateModel<UserDoc>;
  private tokenService: ITokenService;

  constructor(public repositoryUser: any, tokenService: ITokenService) {
    this.repository = repositoryUser;
    this.tokenService = tokenService;
  }

  async register(payload: RegisterInput) {
    const userExist = await this.repository.findOne({ email: payload.email });
    if (userExist) {
      throw new AppError(StatusCodes.BAD_REQUEST, "Email has already been used");
    }
    const createPasswordSecret = crypto.randomUUID();

    const user = await this.repository.create({ ...payload, createPasswordSecret });

    if (!user) {
      throw new AppError(StatusCodes.BAD_REQUEST, "Cannot create user");
    }

    // const linkCreatePassword = this.createLinkCreatePassword(user);

    // TODO: Send mail create password

    const publicKey = crypto.randomBytes(64).toString("hex");
    const privateKey = crypto.randomBytes(64).toString("hex");

    const keyStore = await this.tokenService.createAuthToken({ userId: user._id.toString(), publicKey, privateKey });

    if (!keyStore) throw new AppError(StatusCodes.BAD_REQUEST, "KeyStore Error");

    const tokens = this.tokenService.createTokenPair({ userId: user._id.toString(), email: user.email }, publicKey, privateKey);

    if (!tokens) {
      throw new AppError(StatusCodes.BAD_REQUEST, "Cannot create token");
    }

    return {
      user: {
        email: user.email,
      },
      tokens,
    };
  }

  createLinkCreatePassword(user: User) {
    const userToken = tokenUtils.generateToken({ email: user.email }, user.createPasswordSecret as string, process.env.EXPIRES_TOKEN_CREATE_PASSWORD);
    return tokenUtils.generateToken({ token: userToken }, process.env.CREATE_PASSWORD_SECRET as string, process.env.EXPIRES_TOKEN_CREATE_PASSWORD);
  }

  async verifyCreatePasswordToken(token: string) {
    const userToken = tokenUtils.verifyToken(token, process.env.CREATE_PASSWORD_SECRET as string) as { token: string };
    const data = tokenUtils.decodeToken(userToken.token) as { email: string };

    const user = await this.repository.findOne({ email: data.email });
    if (!user) throw new AppError(StatusCodes.BAD_REQUEST, "Token invalid");

    const verifyToken = tokenUtils.verifyToken(userToken.token, user.createPasswordSecret as string);
    if (!verifyToken) {
      throw new AppError(StatusCodes.BAD_REQUEST, "Token invalid");
    }

    return user;
  }

  async createPassword(payload: CreatePasswordInput) {
    const user = await this.verifyCreatePasswordToken(payload.token);
    if (!user) {
      throw new AppError(StatusCodes.BAD_REQUEST, "Token invalid");
    }
    user.password = bcrypt.hashSync(payload.password, bcrypt.genSaltSync());
    await user.save();
    return user;
  }

  async updateUser(payload: UpdateInformationInput) {
    // const user = await this.verifyCreatePasswordToken();
    // if (!user) {
    //   throw new AppError(StatusCodes.BAD_REQUEST, "Token invalid");
    // }
    // user.password = bcrypt.hashSync(payload, bcrypt.genSaltSync());
    return;
  }
}
