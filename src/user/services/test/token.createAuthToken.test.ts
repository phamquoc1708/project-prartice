import { TokenService } from "../token.service";
import { KeyTokenModel } from "../../models/KeyToken.schema";
import config from "../../../config/config.mongodb";
import mongoose from "mongoose";
import { clearDB, closeDB, newObjectId } from "../../../helpers/testing";

describe("TokenService", () => {
  const tokenService = new TokenService();

  beforeEach(async () => {
    clearDB();
  });

  afterAll(async () => {
    closeDB();
  });

  describe("createAuthToken", () => {
    it("should create a new token in the database", async () => {
      // Arrange
      const userId = (await newObjectId()).toString();
      const privateKey = "private";
      const publicKey = "public";

      // Act
      const result = await tokenService.createAuthToken({ userId, privateKey, publicKey });
      console.log(result);
      // Assert
      expect(result).not.toBeNull();
      expect(result).toHaveProperty("userId", new mongoose.Types.ObjectId(userId));
      expect(result).toHaveProperty("privateKey", privateKey);
      expect(result).toHaveProperty("publicKey", publicKey);
    });

    it("Error payload", async () => {
      const privateKey = "private";
      const publicKey = "public";
      await expect(tokenService.createAuthToken({ userId: "123", privateKey, publicKey })).rejects.toThrow();
    });
  });
});
