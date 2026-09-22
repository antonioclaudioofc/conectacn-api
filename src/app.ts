import express from "express";
import cors from "cors";
import { env } from "./config/env";
import { routes } from "./routes";
import { docsRoutes } from "./docs/swagger.routes";
import { errorHandler, notFoundHandler } from "./middlewares/error-handler";

export const app = express();

app.use(cors({ origin: env.CORS_ORIGIN.split(",").map((o) => o.trim()) }));
app.use(express.json({ limit: "100kb" }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/", (_req, res) => res.redirect("/docs"));
app.use("/docs", docsRoutes);
app.use("/api/v1", routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
