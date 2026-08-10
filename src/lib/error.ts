import { Request, Response, NextFunction } from "express";
import { sendError } from "./response.ts";

export class AppError extends Error {
  public readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
  }
}

export const notFoundHandler = (req: Request, res: Response): void => {
  sendError(res, 404, `Route ${req.method} ${req.originalUrl} not found`);
};

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (err instanceof AppError) {
    sendError(res, err.statusCode, err.message);
    return;
  }
  console.error("Unhandled error:", err);
  sendError(res, 500, "Internal server error");
};