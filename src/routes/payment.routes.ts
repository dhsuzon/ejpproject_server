import { Router, Request, Response } from "express";
import { verifyToken } from "../lib/auth.ts";
import { sendError } from "../lib/response.ts";
import { createOrderController } from "../services/order/order.controller.ts";

const paymentRouter = Router();

paymentRouter.use(verifyToken);

paymentRouter.post("/confirm-order", createOrderController);

paymentRouter.post(
  "/create-payment-intent",
  (_req: Request, res: Response) => {
    sendError(res, 400, "Stripe is not configured. Use demo checkout instead.");
  },
);

export default paymentRouter;