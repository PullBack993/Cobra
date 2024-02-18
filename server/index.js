require("dotenv/config");
const express = require("express");
const databaseConfig = require("./config/database");
const expressConfig = require("./config/express");
const routerConfig = require("./config/routes");
const { connectToBinanceWS, createVolumeWS } = require("./controllers/bigTransfer/transferTracker");
const { createLongShortWS } = require("./controllers/coinsData/lonshShortWS");
const { startSocketServer } = require("./config/socket");

async function start() {
  const app = express();
  expressConfig(app);
  await databaseConfig(app);
  routerConfig(app);

  const PORT = process.env.PORT || 3000;
  console.log(PORT);
  const server = app.listen(PORT, () => console.log(`App start ==> http://localhost:3000`));
  startSocketServer(server);
}


start();