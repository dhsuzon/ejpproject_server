import { Request, Response } from "express";
import { sendSuccess } from "../../lib/response.ts";
import { getRouteId } from "../../lib/http.ts";
import {
  createProductService,
  getAllProductsService,
  getProductByIdService,
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