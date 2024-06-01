const dataController = require("../controllers/data.js");
const userController = require("../controllers/authentication/auth.js");
const newsData = require("../controllers/newsData/newsData");
const x = require("../controllers/xTweet/xTweet");
const trending = require("../controllers/trending/index.js");
const coinsListController = require("../controllers/coinsListController/coinsListController.js");
const gainerloser = require("../controllers/gainerLosers/index.js");  

module.exports = (app) => {
  app.use("/", dataController);
  app.use("/tweet", x);
  app.use("/auth", userController);
  app.use("/news", newsData);
  app.use("/coins", coinsListController);
  app.use("/trending", trending);
  app.use("/gainerlosers", gainerloser);
};

