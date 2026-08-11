import { Request, Response } from "express";
import { sendSuccess } from "../../lib/response.ts";
import { clearAuthCookie, setAuthCookie } from "../../lib/auth.ts";
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
  setAuthCookie(res, result.token);
  sendSuccess(res, 201, "User registered successfully", {
    token: result.token,
    user: result.user,
  });
};

export const loginController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const result = await loginService(req.body);
  setAuthCookie(res, result.token);
  sendSuccess(res, 200, "Login successful", {
    token: result.token,
    user: result.user,
  });
};

export const logoutController = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  clearAuthCookie(res);
  sendSuccess(res, 200, "Logged out successfully", null);
};

export const getCurrentUserController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const id = req.user?.id as string;
  const user = await getCurrentUserService(id);
  sendSuccess(res, 200, "Current user retrieved successfully", user);
};