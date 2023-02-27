const router = require("express").Router();
const dataController = require("../controllers/data.js");
const userController = require("../controllers/authentication/auth.js");
const coinsDataController = require('../controllers/coinsData/exchangeLongShort')

module.exports = (app) => {
  app.use("/", dataController);
  app.use("/auth", userController);
  app.use('/exchange', coinsDataController);
}