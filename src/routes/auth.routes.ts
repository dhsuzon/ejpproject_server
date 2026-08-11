import { Router } from "express";
import { verifyToken } from "../lib/auth.ts";
import {
  getCurrentUserController,
  loginController,
  logoutController,
  registerController,
} from "../services/auth/auth.controller.ts";

const authRouter = Router();

authRouter.post("/register", registerController);
authRouter.post("/login", loginController);
authRouter.post("/logout", logoutController);
authRouter.get("/me", verifyToken, getCurrentUserController);

export default authRouter;