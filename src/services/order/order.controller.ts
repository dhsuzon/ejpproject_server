import { Request, Response } from "express";
import { sendSuccess } from "../../lib/response.ts";
import { getRouteId } from "../../lib/http.ts";
import {
  createOrderService,
  getAllOrdersService,
  getMyOrdersService,
  updateOrderStatusService,
} from "./order.service.ts";

export const createOrderController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const userId = req.user?.id as string;
  const order = await createOrderService(userId, req.body);
  sendSuccess(res, 201, "Order placed successfully", order);
};

export const getMyOrdersController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const userId = req.user?.id as string;
  const orders = await getMyOrdersService(userId);
  sendSuccess(res, 200, "My orders retrieved successfully", orders);
};

export const getAllOrdersController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const orders = await getAllOrdersService();
  sendSuccess(res, 200, "Orders retrieved successfully", orders);
};

export const updateOrderStatusController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const order = await updateOrderStatusService(getRouteId(req), req.body.status);
  sendSuccess(res, 200, "Order status updated successfully", order);
};