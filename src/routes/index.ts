import { Router } from "express";
import authRouter from "./auth.routes.ts";
import categoriesRouter from "./category.routes.ts";
import productsRouter from "./product.routes.ts";
import reviewsRouter from "./review.routes.ts";
import usersRouter from "./user.routes.ts";
import ordersRouter from "./order.routes.ts";
import paymentRouter from "./payment.routes.ts";
import dashboardRouter from "./dashboard.routes.ts";
import newsletterRouter from "./newsletter.routes.ts";

const router = Router();

router.use("/auth", authRouter);
router.use("/users", usersRouter);
router.use("/categories", categoriesRouter);
router.use("/products", productsRouter);
router.use("/reviews", reviewsRouter);
router.use("/orders", ordersRouter);
router.use("/payment", paymentRouter);
router.use("/dashboard", dashboardRouter);
router.use("/newsletter", newsletterRouter);

export default router;