import jwt from "jsonwebtoken";
import { AppError } from "./error";
import { StatusCodes } from "http-status-codes";

export const generateToken = (payload: object, privateKey: string) => {
  return jwt.sign(payload, privateKey, { expiresIn: "20mins" });
};

export const verifyToken = (token: string, secret: string) => {
  try {
    const result = jwt.verify(token, secret);
    return result;
  } catch (error) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Token invalid");
  }
};

export const decodeToken = (token: string) => {
  try {
    const result = jwt.decode(token);
    return result;
  } catch (error) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Token invalid");
  }
};
