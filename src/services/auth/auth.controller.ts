import { Request, Response } from "express";
import { sendSuccess } from "../../lib/response.ts";
import {
  getCurrentUserService,
  loginService,
  registerService,
} from "./auth.service.ts";

export const registerController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const result = await registerService(req.body);
  sendSuccess(res, 201, "User registered successfully", result);
};

export const loginController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const result = await loginService(req.body);
  sendSuccess(res, 200, "Login successful", result);
};

export const getCurrentUserController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const id = req.user?.id as string;
  const user = await getCurrentUserService(id);
  sendSuccess(res, 200, "Current user retrieved successfully", user);
};