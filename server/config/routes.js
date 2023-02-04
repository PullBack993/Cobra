const router = require("express").Router();
const dataController = require("../controllers/data.js");
const userController = require("../controllers/authentication/auth.js");

module.exports = (app) => {
  app.use("/", dataController);
  app.use("/auth", userController);
}