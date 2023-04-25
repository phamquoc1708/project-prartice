import mongoose, { PaginateModel } from "mongoose";
import { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

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

tokenSchema.plugin(mongoosePaginate);

export type TokenDoc = Token & Document;

export const KeyTokenModel = mongoose.model<TokenDoc>("Token", tokenSchema, "tokens") as PaginateModel<TokenDoc>;
