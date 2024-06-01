require("dotenv/config");
const express = require("express");
const databaseConfig = require("./config/database");
const expressConfig = require("./config/express");
const routerConfig = require("./config/routes");
const { startSocketServer } = require("./config/socket");
const compression = require("compression");
// const { uploadImagesToFirebase, uploadLocalImagesToFirebase} = require('./controllers/coinImages/coinImages');

async function start() {
  const app = express();
  app.use(compression());
  expressConfig(app);
  await databaseConfig(app);
  routerConfig(app);

  const PORT = process.env.PORT || 3000;
  const server = app.listen(PORT, () => console.log(`App start ==> http://localhost:3000`));
  startSocketServer(server);
}

start()

//for upload image locally to firebase
// uploadLocalImagesToFirebase(['./ONE.png'], 'one2hero')
