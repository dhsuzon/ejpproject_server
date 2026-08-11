import { Router } from "express";
import { subscribeNewsletterController } from "../services/newsletter/newsletter.controller.ts";

const newsletterRouter = Router();

newsletterRouter.post("/subscribe", subscribeNewsletterController);

export default newsletterRouter;