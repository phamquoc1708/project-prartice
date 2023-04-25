import mongoose, { Model, PaginateModel } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const STATUS_USER = {
  VERIFIED: "VERIFIED",
  UNVERIFIED: "UNVERIFIED",
};

const ROLE_USER = {
  ADMIN: "ADMIN",
  USER: "USER",
};

export interface User {
  fullName?: string;
  email: string;
  mobile?: string;
  password?: string;
  title?: string;
  memo?: string;
  status?: string;
  createPasswordSecret?: string;
  forgotPasswordSecret?: string;
  role?: string;
}

const userSchema = new mongoose.Schema<User>(
  {
    fullName: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    mobile: {
      type: String,
      default: null,
    },
    title: {
      type: String,
    },
    memo: {
      type: String,
      default: null,
    },
    createPasswordSecret: {
      type: String,
    },
    forgotPasswordSecret: {
      type: String,
    },
    password: {
      type: String,
    },
    status: {
      type: String,
      required: true,
      enum: [STATUS_USER.UNVERIFIED, STATUS_USER.VERIFIED],
      default: STATUS_USER.UNVERIFIED,
    },
    role: {
      type: String,
      required: true,
      enum: ROLE_USER,
      default: "USER",
    },
  },
  {
    timestamps: true,
    collection: "Users",
  }
);

userSchema.plugin(mongoosePaginate);
export type UserDoc = User & Document;

export const UserModel = mongoose.model<UserDoc>("User", userSchema, "users") as PaginateModel<UserDoc>;
