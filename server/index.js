const express = require('express');
const expressConfig = require('./config/express');
const routerConfig = require('./config/routes');

start();
async function start() {
  const app = express();
  expressConfig(app);
  routerConfig(app);

  app.listen(3030, () => console.log('REST Service started!'));
}
