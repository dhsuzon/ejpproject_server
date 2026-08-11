import { Router } from "express";
import { isAdmin, verifyToken } from "../lib/auth.ts";
import {
  createProductController,
  getAllProductsController,
  getProductByIdController,
  getProductCategoriesController,
  getProductReviewsController,
  getRelatedProductsController,
  createProductReviewController,
  softDeleteProductController,
  updateProductController,
} from "../services/product/product.controller.ts";

const productsRouter = Router();

productsRouter.get("/categories", getProductCategoriesController);
productsRouter.get("/", getAllProductsController);
productsRouter.get("/:id/reviews", getProductReviewsController);
productsRouter.post("/:id/reviews", verifyToken, createProductReviewController);
productsRouter.get("/:id/related", getRelatedProductsController);
productsRouter.get("/:id", getProductByIdController);
productsRouter.post("/", verifyToken, isAdmin, createProductController);
productsRouter.patch("/:id", verifyToken, isAdmin, updateProductController);
productsRouter.delete("/:id", verifyToken, isAdmin, softDeleteProductController);

export default productsRouter;