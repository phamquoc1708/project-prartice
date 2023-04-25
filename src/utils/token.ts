import jwt from "jsonwebtoken";
import { AppError } from "./error";
import { StatusCodes } from "http-status-codes";

const generateToken = (payload: object, privateKey: string, expiresIn?: string) => {
  return jwt.sign(payload, privateKey, { expiresIn });
};

const verifyToken = (token: string, secret: string) => {
  try {
    const result = jwt.verify(token, secret);
    return result;
  } catch (error) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Token invalid");
  }
};

const decodeToken = (token: string) => {
  try {
    const result = jwt.decode(token);
    return result;
  } catch (error) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Token invalid");
  }
};

export default {
  generateToken,
  verifyToken,
  decodeToken,
};
