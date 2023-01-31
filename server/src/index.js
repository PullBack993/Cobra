require("dotenv/config");
const express = require("express");
const databaseConfig = require("./config/database");
const expressConfig = require("./config/express");
const routerConfig = require("./config/routes");

start();
async function start() {
  const app = express();
  expressConfig(app);
  await databaseConfig(app);
  routerConfig(app);

  const PORT = process.env.PORT
  app.listen(PORT, () => console.log(`App start ==> http://localhost:3000`));
}
