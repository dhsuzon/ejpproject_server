import { Router } from "express";
import { isAdmin, verifyToken } from "../lib/auth.ts";
import {
  createOrderController,
  getAllOrdersController,
  getMyOrdersController,
  updateOrderStatusController,
} from "../services/order/order.controller.ts";

const ordersRouter = Router();

ordersRouter.use(verifyToken);

ordersRouter.post("/", createOrderController);
ordersRouter.get("/my-orders", getMyOrdersController);
ordersRouter.get("/all", isAdmin, getAllOrdersController);
ordersRouter.patch("/:id/status", isAdmin, updateOrderStatusController);

export default ordersRouter;