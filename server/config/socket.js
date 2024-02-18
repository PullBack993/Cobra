const io = require("socket.io");
const { connectToBinanceWS, createVolumeWS } = require("../controllers/bigTransfer/transferTracker");
const { createLongShortWS } = require("../controllers/coinsData/lonshShortWS");

const corsWhitelist = [
    "http://127.0.0.1:5173",
    "http://localhost:3001",
    "http://localhost:5173",
    "http://localhost:8080",
    "https://www.one2hero.com",
    " https://zth-p1d4c2ukk-pullback993.vercel.app",
    "https://zth.vercel.app",
    "https://one2hero.com",
    "www.one2hero.com",
    "https://oen2hero.netlify.app",
  ];
async function startSocketServer(server){
const app = io(server, {
    cors: {
      origin: corsWhitelist,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });
  connectWs(app)
}

async function connectWs(app) {
    await createVolumeWS(app);
    createLongShortWS(app);
    connectToBinanceWS();
  }

  module.exports = {startSocketServer}