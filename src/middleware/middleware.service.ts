import { NextFunction, Request, Response } from "express";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { AppError } from "./../utils/error";
import { HandleFuncError, HandleFunc } from "./../controller";
import { ValidationError } from "ajv";

function errorHandler(error: Error, req: Request, res: Response, next: NextFunction) {
  if (!error) {
    return next();
  }
  if (error instanceof AppError) {
    res.status(error.code).json({ message: error.message });
    return next();
  } else if (error instanceof ValidationError) {
    res.status(StatusCodes.BAD_REQUEST).json({
      code: StatusCodes.BAD_REQUEST,
      error: error.errors[0],
    });
    return next();
  } else {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json("Error Server");
    return next();
  }
}

function errorNotFound(req: Request, res: Response, next: NextFunction) {
  const error = new AppError(StatusCodes.NOT_FOUND, "Not Found");
  console.log("***");
  res.status(StatusCodes.NOT_FOUND).json({
    code: StatusCodes.NOT_FOUND,
    error: error.message,
  });
}

export default {
  errorHandler,
  errorNotFound,
};
