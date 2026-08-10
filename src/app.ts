import express, { Request, Response } from "express";
import cors from "cors";
import routes from "./routes/index.ts";
import { errorHandler, notFoundHandler } from "./lib/error.ts";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req: Request, res: Response): void => {
  res.json({
    success: true,
    message: "SCIC/EJP-13 Backend API is running",
    data: { docs: "/api" },
  });
});

app.use("/api", routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
