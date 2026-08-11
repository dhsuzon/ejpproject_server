import { Request, Response } from "express";
import { sendSuccess } from "../../lib/response.ts";
import { subscribeNewsletterService } from "./newsletter.service.ts";

export const subscribeNewsletterController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const email = await subscribeNewsletterService(req.body.email);
  sendSuccess(res, 200, "Subscribed successfully!", { email });
};