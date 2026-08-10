import { Router } from "express";
import { verifyToken } from "../lib/auth.ts";
import {
  createReviewController,
  getAllReviewsController,
  getReviewByIdController,
  softDeleteReviewController,
  updateReviewController,
} from "../services/review/review.controller.ts";

const reviewsRouter = Router();

reviewsRouter.get("/", getAllReviewsController);
reviewsRouter.get("/:id", getReviewByIdController);
reviewsRouter.post("/", verifyToken, createReviewController);
reviewsRouter.patch("/:id", verifyToken, updateReviewController);
reviewsRouter.delete("/:id", verifyToken, softDeleteReviewController);

export default reviewsRouter;