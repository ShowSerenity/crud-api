//index.jx
const express = require("express"),
  app = express(),
  bodyparser = require("body-parser"),
  morgan = require("morgan");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const ip = require("ip"); // Add ip module for getting user's IP address
require("express-async-errors");

const db = require("./db"),
  bookRoutes = require("./controllers/booksController");
authorRoutes = require("./controllers/authorsController");
genreRoutes = require("./controllers/genresController");

// Swagger Options
const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: "Express API Documentation",
      version: "1.0.0",
      description: "Documentation for Express API",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Local Development Server",
      },
    ],
  },
  apis: ["./controllers/*.js"],
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Serve Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Middleware for logging requests
app.use(morgan("combined"));

// Middleware for parsing JSON in request body
app.use(bodyparser.json());

const logLevels = {
  110: "warn",
  111: "warn",
  112: "warn",
  113: "warn",
  199: "warn",
  214: "warn",
  299: "warn",
  200: "info",
  201: "info",
  204: "info",
  400: "error",
  401: "error",
  404: "error",
  500: "error",
};

// Middleware for logging each request
app.use((req, res, next) => {
  const logLevel = logLevels[res.statusCode] || "info";
  const logMessage = `[${new Date().toISOString()}] ${logLevel.toUpperCase()}: ${req.method} ${req.url} from ${ip.address()}`;

  if (logLevel === "error") {
    console.error(logMessage);
    console.error(`Error Message: ${res.locals.error.message}`);
  } else {
    console[logLevel](logMessage);
  }
  next();
});

// Routes
app.use("/api/books", bookRoutes);
app.use("/api/authors", authorRoutes);
app.use("/api/genres", genreRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  const logMessage = `[${new Date().toISOString()}] ${"ERROR"}: ${req.method} ${req.url} from ${ip.address()}`;

  console.log(logMessage);
  console.error(err);
  res.status(err.status || 500).send("Something went wrong!");
});

// Database connection and server start
db.query("SELECT 1")
  .then(() => {
    console.log("db connection succeeded");
    app.listen(3000, () => console.log("server started at 3000"));
  })
  .catch((err) => console.log("db connection failed. \n" + err));
