import { Request, Response } from "express";
import { sendSuccess } from "../../lib/response.ts";
import { getRouteId } from "../../lib/http.ts";
import {
  createUserRecord,
  getAllUsersService,
  getUserByIdService,
  softDeleteUserService,
  updateUserService,
} from "./user.service.ts";

export const createUserController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const user = await createUserRecord(req.body);
  sendSuccess(res, 201, "User created successfully", user);
};

export const getAllUsersController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const result = await getAllUsersService({
    page: req.query.page?.toString(),
    limit: req.query.limit?.toString(),
    search: req.query.search?.toString(),
  });
  sendSuccess(res, 200, "Users retrieved successfully", result);
};

export const getUserByIdController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const user = await getUserByIdService(getRouteId(req));
  sendSuccess(res, 200, "User retrieved successfully", user);
};

export const updateUserController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const user = await updateUserService(getRouteId(req), req.body);
  sendSuccess(res, 200, "User updated successfully", user);
};

export const softDeleteUserController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  await softDeleteUserService(getRouteId(req));
  sendSuccess(res, 200, "User deleted successfully", { id: getRouteId(req) });
};