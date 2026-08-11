import { Request, Response } from "express";
import { sendSuccess } from "../../lib/response.ts";
import {
  getMonthlyOrdersService,
  getOrderStatusService,
  getStatsService,
} from "./dashboard.service.ts";

export const getStatsController = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  const stats = await getStatsService();
  sendSuccess(res, 200, "Dashboard stats retrieved successfully", stats);
};

export const getMonthlyOrdersController = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  const data = await getMonthlyOrdersService();
  sendSuccess(res, 200, "Monthly orders retrieved successfully", data);
};

export const getOrderStatusController = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  const data = await getOrderStatusService();
  sendSuccess(res, 200, "Order status distribution retrieved successfully", data);
};