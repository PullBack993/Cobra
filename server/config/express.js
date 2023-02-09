const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("../middleware/cors");

module.exports = (app) => {
  app.use(express.json());
  app.use(cors());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(express.json());
};
