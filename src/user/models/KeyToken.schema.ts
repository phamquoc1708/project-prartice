import mongoose, { Model } from "mongoose";
import { Schema } from "mongoose";

export interface Token {
  userId: Schema.Types.ObjectId;
  publicKey: string;
  privateKey: string;
}

const tokenSchema = new mongoose.Schema<Token>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    publicKey: {
      type: String,
      required: true,
    },
    privateKey: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "Tokens",
  }
);

export type TokenDoc = Token & Document;

export const KeyTokenModel = mongoose.model<Token>("Token", tokenSchema);
