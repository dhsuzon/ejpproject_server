import { Router } from "express";
import { isAdmin, isSelfOrAdmin, verifyToken } from "../lib/auth.ts";
import {
  createUserController,
  getAllUsersController,
  getUserByIdController,
  softDeleteUserController,
  updateUserController,
} from "../services/user/user.controller.ts";

const usersRouter = Router();

usersRouter.use(verifyToken);

usersRouter.post("/", isAdmin, createUserController);
usersRouter.get("/", isAdmin, getAllUsersController);
usersRouter.get("/:id", isSelfOrAdmin, getUserByIdController);
usersRouter.patch("/:id", isSelfOrAdmin, updateUserController);
usersRouter.delete("/:id", isAdmin, softDeleteUserController);

export default usersRouter;