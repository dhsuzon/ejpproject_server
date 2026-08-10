import { Router } from "express";
import { verifyToken } from "../lib/auth.ts";
import {
  createProductController,
  getAllProductsController,
  getProductByIdController,
  softDeleteProductController,
  updateProductController,
} from "../services/product/product.controller.ts";

const productsRouter = Router();

productsRouter.get("/", getAllProductsController);
productsRouter.get("/:id", getProductByIdController);
productsRouter.post("/", verifyToken, createProductController);
productsRouter.patch("/:id", verifyToken, updateProductController);
productsRouter.delete("/:id", verifyToken, softDeleteProductController);

export default productsRouter;