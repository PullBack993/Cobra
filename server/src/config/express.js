const express = require("express");
const cors = require("cors");
// const cors = require("../src/middleware/cors");

module.exports = (app) => {
  app.use(express.json());
  app.use(cors());
};
