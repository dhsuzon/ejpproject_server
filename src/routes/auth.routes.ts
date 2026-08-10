import { Router } from "express";
import { verifyToken } from "../lib/auth.ts";
import {
  getCurrentUserController,
  loginController,
  registerController,
} from "../services/auth/auth.controller.ts";

const authRouter = Router();

authRouter.post("/register", registerController);
authRouter.post("/login", loginController);
authRouter.get("/me", verifyToken, getCurrentUserController);

export default authRouter;