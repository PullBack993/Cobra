require("dotenv/config");
const express = require("express");
const databaseConfig = require("./config/database");
const expressConfig = require("./config/express");
const routerConfig = require("./config/routes");
const {
  connectToBinanceWS,
  createWebSocketServer,
} = require("./controllers/bigTransfer/transferTracker");

start();
async function start() {
  const app = express();
  expressConfig(app);
  await databaseConfig(app);
  routerConfig(app);
  connectWs();

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`App start ==> http://localhost:3000`));
}

function connectWs() {
  connectToBinanceWS();
  createWebSocketServer(8080);
}
