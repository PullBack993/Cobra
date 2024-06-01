const io = require("socket.io");
const { connectToBinanceWS, createVolumeWS } = require("../controllers/bigTransfer/transferTracker");

const corsWhitelist = [
    "http://localhost:3001",
    "http://localhost:5173",
    "http://localhost:8080",
    "https://www.one2hero.com",
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
    connectToBinanceWS();
  }

  module.exports = {startSocketServer}
