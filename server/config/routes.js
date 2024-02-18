const dataController = require("../controllers/data.js");
const userController = require("../controllers/authentication/auth.js");
const coinsDataController = require("../controllers/coinsData/scrapingLongShort");
const newsData = require("../controllers/newsData/newsData");
const x = require("../controllers/xTweet/xTweet");
const coinsListController = require('../controllers/coinsListController/coinsListController.js');  

module.exports = (app) => {
  app.use("/", dataController);
  app.use("/tweet", x);
  app.use("/auth", userController);
  app.use("/news", newsData);
  app.use("/exchange", coinsDataController);
  app.use('/coins', coinsListController);
};
