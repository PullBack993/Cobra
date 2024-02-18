const io = require("socket.io");
const { calculateLongShortAverage, getLastLongShortData } = require("./store");
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
let currentUse;
const activeUsers = new Map();

let longShortWS;
async function createLongShortWS(server) {
  const app = server
  longShortWS = app.of("/long-short");
  longShortWS.on("connection", (socket) => {
    // Handle the subscribe event
    socket.on("subscribe", (data) => {
      const { coin, time, type, user } = data;
      const userPreferences = { coin, time, type };
      currentUse = [user, { socket, preferences: userPreferences }];
      immediatelySendDataOnSubscribe(currentUse);
      activeUsers.set(user, { socket, preferences: userPreferences });
    });
    socket.on("disconnect", () => {
    });
    socket.on("removeUser", (userData) => {
      const userId = userData.user;
      const user = activeUsers.get(userId);
      if (user) {
        activeUsers.delete(userId);
      }
    });
  });
}
async function emitLastUpdate(coin, socket) {
  socket.emit("newData", await getLastLongShortData(coin));
}
async function emitAverageUpdate(coin, socket, time) {
  socket.emit("newData", await calculateLongShortAverage(coin, time));
}

async function emitData(savedCoin) {
  for (const [userId, { socket, preferences }] of activeUsers.entries()) {
    if (preferences.coin === savedCoin.coinName) {
      preferences.type === "last"
        ? emitLastUpdate(preferences.coin, socket)
        : emitAverageUpdate(preferences.coin, socket, preferences.time);
    }
  }
}

async function immediatelySendDataOnSubscribe(currentUserData) {
  const [userId, { socket, preferences }] = currentUserData;
  preferences.type === "last"
    ? emitLastUpdate(preferences.coin, socket)
    : emitAverageUpdate(preferences.coin,socket, preferences.time);
}

module.exports = {
  createLongShortWS,
  emitData,
};
