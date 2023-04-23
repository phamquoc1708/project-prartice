import { NextFunction, Request, Response } from "express";

export type HandleFunc = (req: Request, res: Response, next: NextFunction) => Promise<void> | void;
export type HandleFuncError = (error: Error, req: Request, res: Response, next: NextFunction) => Promise<void> | void;
