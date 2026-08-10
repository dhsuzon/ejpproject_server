import { Request, Response, NextFunction } from "express";

export type VerifyMiddlewareType = (
  req: Request,
  res: Response,
  next: NextFunction,
) => void;

export type HashPasswordFunctionType = (password: string) => Promise<string>;

export type VerifyPasswordFunctionType = (
  password: string,
  hashedPassword: string,
) => Promise<boolean>;