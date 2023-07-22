const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("../middleware/cors");
const RateLimit = require("express-rate-limit");
const limiter = RateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100,
});

module.exports = (app) => {
  app.use(express.json());
  app.use(cors());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  // Apply rate limiter to all requests
  app.use(limiter);

  // Global error handler
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send("Internal Server Error");
  });
};
