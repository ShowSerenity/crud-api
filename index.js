//index.jx
const express = require("express"),
  app = express(),
  bodyparser = require("body-parser"),
  morgan = require("morgan");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const ip = require("ip"); // Add ip module for getting user's IP address
const { Client } = require("cassandra-driver");
const expressWinston = require("express-winston");
const { transports, format } = require("winston");

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

app.use(
  expressWinston.logger({
    transports: [
      new transports.Console(),
      new transports.File({
        level: "warn",
        filename: "./logs/logsWarnings.log",
      }),
      new transports.File({
        level: "error",
        filename: "./logs/logsErrors.log",
      }),
    ],
    format: format.combine(
      format.json(),
      format.timestamp(),
      format.prettyPrint(),
    ),
    statusLevels: true,
  }),
);

// Serve Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Middleware for logging requests
app.use(morgan("combined"));

// Middleware for parsing JSON in request body
app.use(bodyparser.json());

// Routes
app.use("/api/books", bookRoutes);
app.use("/api/authors", authorRoutes);
app.use("/api/genres", genreRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
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

const client = new Client({
  contactPoints: ["172.17.0.2"], // Replace with your ScyllaDB contact points
  localDataCenter: "datacenter1", // Replace with your data center name
});

client
  .connect()
  .then(() => console.log("Connected to ScyllaDB"))
  .catch((err) => console.error("Error connecting to ScyllaDB:", err));
