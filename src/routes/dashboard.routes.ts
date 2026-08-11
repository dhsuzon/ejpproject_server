import { Router } from "express";
import { isAdmin, verifyToken } from "../lib/auth.ts";
import {
  getMonthlyOrdersController,
  getOrderStatusController,
  getStatsController,
} from "../services/dashboard/dashboard.controller.ts";

const dashboardRouter = Router();

dashboardRouter.use(verifyToken, isAdmin);

dashboardRouter.get("/stats", getStatsController);
dashboardRouter.get("/monthly-orders", getMonthlyOrdersController);
dashboardRouter.get("/order-status", getOrderStatusController);

export default dashboardRouter;