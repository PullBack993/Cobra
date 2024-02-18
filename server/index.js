require("dotenv/config");
const express = require("express");
const databaseConfig = require("./config/database");
const expressConfig = require("./config/express");
const routerConfig = require("./config/routes");
const { startSocketServer } = require("./config/socket");

async function start() {
  const app = express();
  expressConfig(app);
  await databaseConfig(app);
  routerConfig(app);

  const PORT = process.env.PORT || 3000;
  const server = app.listen(PORT, () => console.log(`App start ==> http://localhost:3000`));
  startSocketServer(server);
}

start();
