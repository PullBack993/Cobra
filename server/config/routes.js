const dataController = require("../controllers/data.js");

module.exports = (app) => {
  app.get("/", (req, res) => {
    res.json({ message: "REST Service Operational" });
  });

  app.use(dataController);
};
