import { KeyTokenModel } from "./../models/KeyToken.schema";
import { AppError } from "../../utils/error";
import { StatusCodes } from "http-status-codes";

export interface ITokenService {
  createAuthToken({ userId, privateKey, publicKey }: { userId: string; privateKey: string; publicKey: string }): Promise<object>;
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
}