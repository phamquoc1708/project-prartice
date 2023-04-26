import { StatusCodes } from "http-status-codes";
import { AppError } from "../utils/error";
import tokenUtil from "../utils/token";
import { KeyTokenModel } from "../user/models/KeyToken.schema";
import { Request, Response, NextFunction, RequestHandler } from "express";
import { UserJWT } from "../user/types/user.type";
import mongoose from "mongoose";

const HEADER = {
  API_KEY: "x-api-key",
  AUTHORIZATION: "authorization",
};

export interface newRequest extends Request {
  user?: any;
}

// }

export const checkAuth: RequestHandler = async (req: newRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers[HEADER.AUTHORIZATION] as string;
    if (!token) {
      return res.status(StatusCodes.UNAUTHORIZED).json("Forbidden Error");
    }
    const user = tokenUtil.decodeToken(token as string) as UserJWT;
    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).json("Forbidden Error");
    }
    const data = await KeyTokenModel.findOne({ userId: new mongoose.Types.ObjectId(user.userId) });
    if (!data) {
      return res.status(StatusCodes.UNAUTHORIZED).json("Forbidden Error");
    }
    const userReq = tokenUtil.verifyToken(token, data.privateKey);
    req.user = userReq;
    return next();
  } catch (err) {
    return next(err);
  }
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};
