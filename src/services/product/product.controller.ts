import { Request, Response } from "express";
import { sendSuccess } from "../../lib/response.ts";
import { getRouteId } from "../../lib/http.ts";
import {
  createProductReviewService,
  createProductService,
  getAllProductsService,
  getProductByIdService,
  getProductCategoriesService,
  getProductReviewsService,
  getRelatedProductsService,
  softDeleteProductService,
  updateProductService,
} from "./product.service.ts";

export const createProductController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const product = await createProductService(req.body);
  sendSuccess(res, 201, "Product created successfully", product);
};

export const getAllProductsController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const result = await getAllProductsService({
    page: req.query.page?.toString(),
    limit: req.query.limit?.toString(),
    search: req.query.search?.toString(),
    categoryId: req.query.categoryId?.toString(),
    category: req.query.category?.toString(),
    sort: req.query.sort?.toString(),
    minPrice: req.query.minPrice?.toString(),
    maxPrice: req.query.maxPrice?.toString(),
  });
  sendSuccess(res, 200, "Products retrieved successfully", result);
};

export const getProductByIdController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const product = await getProductByIdService(getRouteId(req));
  sendSuccess(res, 200, "Product retrieved successfully", product);
};

export const getProductCategoriesController = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  const categories = await getProductCategoriesService();
  sendSuccess(res, 200, "Product categories retrieved successfully", categories);
};

export const getRelatedProductsController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const products = await getRelatedProductsService(getRouteId(req));
  sendSuccess(res, 200, "Related products retrieved successfully", products);
};

export const getProductReviewsController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const reviews = await getProductReviewsService(getRouteId(req));
  sendSuccess(res, 200, "Product reviews retrieved successfully", reviews);
};

export const createProductReviewController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const userId = req.user?.id as string;
  const review = await createProductReviewService(getRouteId(req), userId, req.body);
  sendSuccess(res, 201, "Review created successfully", review);
};

export const updateProductController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const product = await updateProductService(getRouteId(req), req.body);
  sendSuccess(res, 200, "Product updated successfully", product);
};

export const softDeleteProductController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  await softDeleteProductService(getRouteId(req));
  sendSuccess(res, 200, "Product deleted successfully", {
    id: getRouteId(req),
  });
};