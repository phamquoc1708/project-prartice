import crypto from "crypto";
import _ from "lodash";
import bcrypt from "bcrypt";

import { generateToken, verifyToken, decodeToken } from "./../../utils/token";
import { TokenService, ITokenService } from "./token.service";
import { StatusCodes } from "http-status-codes";
import { AppError } from "./../../utils/error";
import { UserModel, User } from "./../models/User.schema";
import { RegisterInput, RegisterOutput, CreatePasswordInput, UpdateInformationInput } from "./../types/user.type";
import { createTokenPair } from "../../auth/authUtils";

export interface IUserService {
  register(payload: RegisterInput): Promise<RegisterOutput>;
  verifyCreatePasswordToken(payload: string): Promise<User>;
  createLinkCreatePassword(payload: User): string;
  createPassword(payload: CreatePasswordInput): Promise<void>;
  updateUser(payload: UpdateInformationInput): Promise<void>;
}

export class UserService implements IUserService {
  private repository = UserModel;
  private tokenService: ITokenService = new TokenService();

  constructor() {}

  async register(payload: RegisterInput) {
    const userExist = await this.repository.findOne({ email: payload.email });
    if (userExist) {
      throw new AppError(StatusCodes.BAD_GATEWAY, "Email has already been used");
    }
    const createPasswordSecret = crypto.randomUUID();
    console.log(payload);
    let user;
    try {
      user = await this.repository.create({ ...payload, createPasswordSecret });
    } catch (err) {
      console.log(err);
    }
    console.log(user);
    if (!user) {
      throw new AppError(StatusCodes.BAD_REQUEST, "Cannot create user");
    }

    // const linkCreatePassword = this.createLinkCreatePassword(user);

    // TODO: Send mail create password

    const publicKey = crypto.randomBytes(64).toString("hex");
    const privateKey = crypto.randomBytes(64).toString("hex");

    const keyStore = await this.tokenService.createAuthToken({ userId: user._id.toString(), publicKey, privateKey });

    if (!keyStore) throw new AppError(StatusCodes.BAD_REQUEST, "KeyStore Error");

    const tokens = createTokenPair({ userId: user._id.toString(), email: user.email }, publicKey, privateKey);

    if (!tokens) {
      throw new AppError(StatusCodes.BAD_REQUEST, "Cannot create user");
    }

    return {
      user: {
        email: user.email,
      },
      tokens,
    };
  }

  createLinkCreatePassword(user: User) {
    const userToken = generateToken({ email: user.email }, user.createPasswordSecret as string);
    return generateToken({ userToken }, process.env.CREATE_PASSWORD_SECRET as string);
  }

  async verifyCreatePasswordToken(token: string) {
    const userToken = verifyToken(token, process.env.CREATE_PASSWORD_SECRET as string);

    const data = decodeToken(userToken as string) as { email: string };

    const user = await this.repository.findOne({ email: data.email });

    if (!user) {
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
    return;
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
