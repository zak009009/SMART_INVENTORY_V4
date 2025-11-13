const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const { authLimiter, apiLimiter } = require("./middlewares/rateLimit");

const authRouter = require("./routes/auth.routes");
const productsRouter = require("./routes/products.routes");
const ordersRouter = require("./routes/orders.routes");

const logger = require("./middlewares/logger");
const errorHandler = require("./middlewares/errorHandler");

const app = express();
const morgan = require("morgan");
const config = require("./config/config");


if (config.env === "development") {
  app.use(morgan("dev")); // format court et coloré
} else if (config.env !== "test") {
  app.use(morgan("combined")); // format complet (Apache-like), pas en test
}

app.use(helmet());
app.use(cors());

app.use(express.json());
app.use(express.static('public'));
if (config.env !== "test") {
  app.use(logger);
}

if (config.env !== "test") {
  app.use("/api", apiLimiter);
  app.use("/api/auth", authLimiter, authRouter);
} else {
  app.use("/api/auth", authRouter);
}
app.use("/api/products", productsRouter);
app.use("/api/orders", ordersRouter);
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Handle 404 - Route not found
app.use('*', (req, res, next) => {
  const error = new Error(`Route ${req.originalUrl} not found`);
  error.statusCode = 404;
  next(error);
});

// Handle 405 - Method not allowed (this should be handled by Express automatically, but adding explicit handling)
app.use((err, req, res, next) => {
  if (err.status === 405 || err.statusCode === 405) {
    return res.status(405).json({
      status: 'error',
      message: 'Method not allowed'
    });
  }
  next(err);
});

app.use(errorHandler);
module.exports = app;
