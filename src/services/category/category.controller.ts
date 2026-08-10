import { Request, Response } from "express";
import { sendSuccess } from "../../lib/response.ts";
import { getRouteId } from "../../lib/http.ts";
import {
  createCategoryService,
  getAllCategoriesService,
  getCategoryByIdService,
  softDeleteCategoryService,
  updateCategoryService,
} from "./category.service.ts";

export const createCategoryController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const category = await createCategoryService(req.body);
  sendSuccess(res, 201, "Category created successfully", category);
};

export const getAllCategoriesController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const result = await getAllCategoriesService({
    page: req.query.page?.toString(),
    limit: req.query.limit?.toString(),
    search: req.query.search?.toString(),
  });
  sendSuccess(res, 200, "Categories retrieved successfully", result);
};

export const getCategoryByIdController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const category = await getCategoryByIdService(getRouteId(req));
  sendSuccess(res, 200, "Category retrieved successfully", category);
};

export const updateCategoryController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const category = await updateCategoryService(getRouteId(req), req.body);
  sendSuccess(res, 200, "Category updated successfully", category);
};

export const softDeleteCategoryController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  await softDeleteCategoryService(getRouteId(req));
  sendSuccess(res, 200, "Category deleted successfully", {
    id: getRouteId(req),
  });
};