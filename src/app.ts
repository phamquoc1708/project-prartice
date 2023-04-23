import express from "express";
import MiddlewareService from "./middleware/middleware.service";
import routes from "./routes";
import morgan from "morgan";

const app: express.Application = express();

// Connect db
import("./db/init.mongodb");

// Handling '/' Request
app.use(express.json());
app.use(express.urlencoded());
app.use(morgan("dev"));

app.use(routes);

// Middleware
app.use(MiddlewareService.errorNotFound);

// handing error
app.use(MiddlewareService.errorHandler);

export default app;
