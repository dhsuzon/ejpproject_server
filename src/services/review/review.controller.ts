import { Request, Response } from "express";
import { sendSuccess } from "../../lib/response.ts";
import { getRouteId } from "../../lib/http.ts";
import {
  createReviewService,
  getAllReviewsService,
  getReviewByIdService,
  softDeleteReviewService,
  updateReviewService,
} from "./review.service.ts";

export const createReviewController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const userId = req.user?.id as string;
  const review = await createReviewService(req.body, userId);
  sendSuccess(res, 201, "Review created successfully", review);
};

export const getAllReviewsController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const result = await getAllReviewsService({
    page: req.query.page?.toString(),
    limit: req.query.limit?.toString(),
    productId: req.query.productId?.toString(),
  });
  sendSuccess(res, 200, "Reviews retrieved successfully", result);
};

export const getReviewByIdController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const review = await getReviewByIdService(getRouteId(req));
  sendSuccess(res, 200, "Review retrieved successfully", review);
};

export const updateReviewController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const userId = req.user?.id as string;
  const role = req.user?.role as "USER" | "ADMIN";
  const review = await updateReviewService(getRouteId(req), req.body, userId, role);
  sendSuccess(res, 200, "Review updated successfully", review);
};

export const softDeleteReviewController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const userId = req.user?.id as string;
  const role = req.user?.role as "USER" | "ADMIN";
  await softDeleteReviewService(getRouteId(req), userId, role);
  sendSuccess(res, 200, "Review deleted successfully", {
    id: getRouteId(req),
  });
};