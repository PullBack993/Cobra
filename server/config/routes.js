const router = require("express").Router();
const dataController = require("../controllers/data.js");
const userController = require("../controllers/authentication/auth.js");
const coinsDataController = require("../controllers/coinsData/exchangeLongShort");
const newsData = require("../controllers/newsData/newsData");
const transfer = require("../controllers/bigTransfer/transferTracker");

module.exports = (app) => {
  app.use("/", dataController);
  app.use("/auth", userController);
  app.use("/news", newsData);
  app.use("/exchange", coinsDataController);
  app.use("/transfer", transfer)
};
