import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { Role } from "../generated/prisma/client.ts";
import { sendError } from "./response.ts";
import {
  HashPasswordFunctionType,
  VerifyMiddlewareType,
  VerifyPasswordFunctionType,
} from "./types/auth.type.ts";

export interface JwtPayload {
  id: string;
  role: Role;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const createToken = (payload: JwtPayload): string => {
  const secret: string = process.env.SECRET as string;
  return jwt.sign(payload, secret, { expiresIn: "7d" });
};

export const verifyToken: VerifyMiddlewareType = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const authHeader: string | undefined = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return sendError(res, 401, "Unauthorized: No token provided");
    }
    const token: string = authHeader.split(" ")[1] as string;
    const secret: string = process.env.SECRET as string;
    const decoded: JwtPayload = jwt.verify(token, secret) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return sendError(res, 403, "Forbidden: Invalid or expired token");
  }
};

export const isAdmin: VerifyMiddlewareType = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (req.user?.role !== Role.ADMIN) {
    return sendError(res, 403, "Forbidden: Admin access required");
  }
  next();
};

export const isSelfOrAdmin: VerifyMiddlewareType = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const id = typeof req.params.id === "string" ? req.params.id : undefined;
  if (req.user && (req.user.id === id || req.user.role === Role.ADMIN)) {
    next();
    return;
  }
  return sendError(res, 403, "Forbidden: You can only access your own account");
};

export const PasswordHash: HashPasswordFunctionType = async (
  password: string,
): Promise<string> => {
  const rounds: number = Number(process.env.BCRYPT_PASSWORD_SLOT) || 10;
  return bcrypt.hash(password, rounds);
};

export const PasswordVerify: VerifyPasswordFunctionType = async (
  password: string,
  hashedPassword: string,
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};