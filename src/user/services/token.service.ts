import { KeyTokenModel } from "./../models/KeyToken.schema";
import { AppError } from "../../utils/error";
import { StatusCodes } from "http-status-codes";
import JWT from "jsonwebtoken";

export interface ITokenService {
  createAuthToken({ userId, privateKey, publicKey }: { userId: string; privateKey: string; publicKey: string }): Promise<object>;
  createTokenPair(payload: object, publicKey: string, privateKey: string): { accessToken: string; refreshToken: string };
  deleteTokenByUserId(userId: string): Promise<void>;
}

export class TokenService implements ITokenService {
  private repository = KeyTokenModel;

  async createAuthToken({ userId, privateKey, publicKey }: { userId: string; privateKey: string; publicKey: string }) {
    const keyStore = await this.repository.create({
      userId: userId,
      privateKey,
      publicKey,
    });

    return keyStore;
  }

  createTokenPair(payload: object, publicKey: string, privateKey: string) {
    const accessToken = JWT.sign(payload, publicKey, { expiresIn: "7 days" });
    const refreshToken = JWT.sign(payload, privateKey, { expiresIn: "7 days" });

    return { accessToken, refreshToken };
  }

  async deleteTokenByUserId(userId: string) {
    await this.repository.deleteOne({ userId });
    return;
  }
}
