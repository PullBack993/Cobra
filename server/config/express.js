const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("../middleware/cors");
const RateLimit = require("express-rate-limit");
const limiter = RateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,  // max 100 requests per windowMs
});

module.exports = (app) => {
  app.use(express.json());
  app.use(cors());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(limiter);

  // Global error handler
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send("Internal Server Error");
  });
};
