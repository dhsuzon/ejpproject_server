import { Router } from "express";
import authRouter from "./auth.routes.ts";
import categoriesRouter from "./category.routes.ts";
import productsRouter from "./product.routes.ts";
import reviewsRouter from "./review.routes.ts";
import usersRouter from "./user.routes.ts";

const router = Router();

router.use("/auth", authRouter);
router.use("/users", usersRouter);
router.use("/categories", categoriesRouter);
router.use("/products", productsRouter);
router.use("/reviews", reviewsRouter);

export default router;