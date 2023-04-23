import { StatusCodes } from "http-status-codes";

export class AppError extends Error {
  public code: StatusCodes;

  constructor(code: StatusCodes, message: string) {
    super(message);
    this.code = code;
    this.message = message;
  }
}
