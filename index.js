//index.jx
const express = require("express"),
  app = express(),
  bodyparser = require("body-parser"),
  morgan = require("morgan");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const expressWinston = require("express-winston");
const { transports, format } = require("winston");
const cookieParser = require("cookie-parser");
const authMiddleware = require("./middleware/authMiddleware");

require("dotenv").config();

require("express-async-errors");

const db = require("./db"),
  bookRoutes = require("./routes/booksRouter"),
  authorRoutes = require("./routes/authoursRouter"),
  genreRoutes = require("./routes/genresRouter"),
  userRoutes = require("./routes/usersRouter");

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
  apis: ["./routes/*.js"],
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use(
  expressWinston.logger({
    transports: [new transports.Console()],
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

app.use(cookieParser());

// Routes
app.use("/books", authMiddleware, bookRoutes);
app.use("/authors", authorRoutes);
app.use("/genres", genreRoutes);
app.use("/users", userRoutes);

// Error handling middleware
app.use((err, req, res) => {
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
