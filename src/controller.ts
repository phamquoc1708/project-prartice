import { NextFunction, Request, Response } from "express";
import { newRequest } from "./auth/checkAuth";

export type HandleFunc = (req: newRequest, res: Response, next: NextFunction) => Promise<void> | void;
export type HandleFuncError = (error: Error, req: Request, res: Response, next: NextFunction) => Promise<void> | void;
