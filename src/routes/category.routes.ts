import { Router } from "express";
import { verifyToken } from "../lib/auth.ts";
import {
  createCategoryController,
  getAllCategoriesController,
  getCategoryByIdController,
  softDeleteCategoryController,
  updateCategoryController,
} from "../services/category/category.controller.ts";

const categoriesRouter = Router();

categoriesRouter.get("/", getAllCategoriesController);
categoriesRouter.get("/:id", getCategoryByIdController);
categoriesRouter.post("/", verifyToken, createCategoryController);
categoriesRouter.patch("/:id", verifyToken, updateCategoryController);
categoriesRouter.delete("/:id", verifyToken, softDeleteCategoryController);

export default categoriesRouter;