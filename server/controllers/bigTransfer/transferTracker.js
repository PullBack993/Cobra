const WebSocket = require("ws");
const http = require("http");
const socketIO = require("socket.io");
const https = require("https");
const CronJob = require("cron").CronJob;
const CoinGecko = require("coingecko-api");
const allCoins = require("../../coins.json");
const CoinGeckoClient = new CoinGecko();

let coinImageCache = {};
let customWS;
let binanceWS;
let lastMessageTime = 0;
const maxValues = 100;
let last20Values = [];
let selectedVolume = 1;
let btcPrice;
// startCronJobs();

async function connectToBinanceWS() {
  try {
    const coins100 = await get100CoinsByPrice();
    console.log('Creating WebSocket...');

    binanceWS = new WebSocket("wss://stream.binance.com:9443/ws");


    binanceWS.on("open", () => {
      binanceWS.send(
        JSON.stringify({
          method: "SUBSCRIBE",
          params: coins100.map((coin) => coin.name),
          id: 1,
        })
      );
    });
 
    binanceWS.on("message", (data) => {
      const now = Date.now();
      const msg = JSON.parse(data);
      coins100.forEach(async (coin, index) => {
        if (
          msg.s === coin.symbol &&
          msg.e === "trade" &&
          msg.q >= (coin.qEqBTC)
        ) {
          const searchedCoin = findCoin(allCoins, msg.s.split("USDT")[0]);
          msg.image = await fetchCoinImage(searchedCoin);
          const test = (msg.p * msg.q) / btcPrice
          msg.beq = test;
          msg.T = convertTimestamp(msg.T);
          last20Values.push(msg);
          if (last20Values.length > maxValues) {
            last20Values.shift();
          }
          sendToClient(last20Values);
        }
      });

      lastMessageTime = now;
    });
    binanceWS.on('error', (error) => {
      console.error('WebSocket error:', error);
      // Attempt to reconnect.
      setTimeout(reconnectToBinanceWS, 1000); // Adjust the delay as needed.
    });

    setTimeout(reconnectToBinanceWS, 2 * 60 * 60 * 1000);

    return sendToClient;
  } catch (error) {
    console.error(error);
  }
}
async function reconnectToBinanceWS() {
  if (binanceWS) {
    binanceWS.close();
  }
  connectToBinanceWS();
}


async function fetchCoinImage(coin) {
  try {
    if (coinImageCache[coin?.id]) {
      return coinImageCache[coin?.id];
    } else {
      let image;

      // Retry logic
      let retries = 3;
      while (retries > 0) {
        try {
          image = await CoinGeckoClient.coins.fetch(coin.id);
          break; // Break out of the loop if fetch succeeds
        } catch (error) {
          console.error("fetchCoinImage", error);
          retries--;
        }
      }

      const imageUrl = determineImage(image);
      coinImageCache[coin.id] = imageUrl;
      return imageUrl;
    }
  } catch (error) {
    console.error("fetchCoinImage", error);
  }
}


function determineImage(image) {
  return image?.data?.image?.thumb
    ? image.data.image?.thumb
    : image.data.image?.large
    ? image.data.image?.large
    : image.data.image?.small;
}

function findCoin(allCoins, searchParams) {
  const searchedCoin = allCoins.find((coin) => {
    if (
      coin?.id === searchParams.toLowerCase() ||
      coin?.symbol === searchParams.toLocaleLowerCase()
    ) {
      return coin;
    }
    return null;
  });
  return searchedCoin;
}

function convertTimestamp(timestamp) {
  const date = new Date(timestamp);

  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear().toString();
  const hour = date.getHours().toString().padStart(2, "0");
  const minute = date.getMinutes().toString().padStart(2, "0");
  const second = date.getSeconds().toString().padStart(2, "0");

  return `${day}.${month}.${year} ${hour}:${minute}:${second}`;
}

function createWebSocketServer(server) {
  const corsWhitelist = ["http://127.0.0.1:5173", "http://localhost:5173", "http://localhost:8080","https://www.one2hero.com", " https://zth-p1d4c2ukk-pullback993.vercel.app", "https://zth.vercel.app", "https://one2hero.com", "www.one2hero.com"];

  customWS = socketIO(server, {
    cors: {
      origin: corsWhitelist,
      methods: ["GET", "POST"],
      allowedHeaders: ["my-custom-header"],
      credentials: true,
    },
  });
  customWS.on("connection", socket => {
    if (last20Values) {
      customWS.emit("message", JSON.stringify(last20Values));
    }
  });
}

function sendToClient(data) {
  customWS.emit("message", JSON.stringify(data));
}

async function getBtcPrice() {
  try {
    return new Promise((resolve, reject) => {
      https
        .get(process.env.BINANCE_BTC_PRICE, (response) => {
          let btcPrice = "";

          response.on("data", (chunk) => {
            btcPrice += chunk;
          });

          response.on("end", () => {
            resolve(JSON.parse(btcPrice).price);
          });
        })
        .on("error", (error) => {
          reject(error);
        });
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function get100CoinsByPrice() {
  btcPrice = await getBtcPrice();
  try {
    return new Promise((resolve, reject) => {
      https
        .get(process.env.BINANCE_TICKET_PRICE , (resp) => {
          let data = "";

          resp.on("data", (chunk) => {
            data += chunk;
          });

          resp.on("end", () => {
            const results = JSON.parse(data);
            const usdtPairs = results.filter((pair) => pair.symbol.endsWith("USDT"));

            const sortedPairs = usdtPairs.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));

            const pairs = sortedPairs.slice(0, 250).map((result) => ({
              symbol: result.symbol,
              name: result.symbol.toLowerCase() + "@trade",
              price: result.price,
              qEqBTC: (btcPrice * 0.5) / result.price, // half of price mean 0.5 btc selected
            }));
            resolve(pairs);
          });
        })

        .on("error", (err) => {
          console.log("Error: " + err.message);
        });
    });
  } catch (error) {
    console.error(error);
  }
}
  const jobGetCurrentPriceBTC = new CronJob(" */1 * * * *", async () => {
    btcPrice = await getBtcPrice();
  });

  jobGetCurrentPriceBTC.start();

module.exports = {
  connectToBinanceWS,
  createWebSocketServer,
};
