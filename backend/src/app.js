import express from "express";
import routes from "./routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";

export default function createApp() {
  const app = express();
  app.use(express.json());

  app.use("/auth", routes.auth);
  app.use("/", routes.api);

  app.use(errorHandler);

  return app;
}
