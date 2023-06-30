const WebSocket = require("ws");
const WebSocketServer = require("ws");
const router = require("../newsData/newsData");
const https = require("https");

const wws = new WebSocketServer({
  port: 8081,
});

let lastMessageTime = 0;
const maxValues = 50;
let last50Values = [];
let retry = 0;
const maxRetry = 10;
const destinationWebSocket = createWebSocket();
router.get("/", async (req, res) => {
  const coins100 = await get100CoinsByPrice();
  const ws = new WebSocket("wss://stream.binance.com:9443/ws");

  ws.on("open", () => {
    ws.send(
      JSON.stringify({
        method: "SUBSCRIBE",
        params: coins100.map((coin) => coin.name),
        id: 1,
      })
    );
  });

  ws.on("message", (data) => {
    const now = Date.now();
    const msg = JSON.parse(data);
    coins100.forEach((coin, index) => {
      if (
        msg.s === coin.symbol &&
        msg.e === "aggTrade" &&
        msg.q > coin.qEqBTC &&
        now - lastMessageTime < 50
      ) {
        last50Values.push(msg);
        if (last50Values.length > maxValues) {
          last50Values.shift();
        }

        destinationWebSocket.send(JSON.stringify(last50Values));
        console.log(msg.s, coin.symbol);
        console.log(msg.q, coin.qEqBTC);
        if (msg.m) {
          console.log(msg.m, "BUY");
        } else {
          console.log("SELL");
        }
      }
    });

    lastMessageTime = now;
  });
});

async function getBtcPrice() {
  try {
    return new Promise((resolve, reject) => {
      https
        .get("https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT", (response) => {
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

async function get100CoinsByPrice(selectedValue = 1) {
  const btcPrice = await getBtcPrice();
  try {
    return new Promise((resolve, reject) => {
      https
        .get("https://api.binance.com/api/v3/ticker/price", (resp) => {
          let data = "";

          resp.on("data", (chunk) => {
            data += chunk;
          });

          resp.on("end", () => {
            const results = JSON.parse(data);
            const usdtPairs = results.filter((pair) => pair.symbol.endsWith("USDT"));

            const sortedPairs = usdtPairs.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
            console.log(sortedPairs);

            const pairs = sortedPairs.slice(0, 150).map((result) => ({
              symbol: result.symbol,
              name: result.symbol.toLowerCase() + "@aggTrade",
              price: result.price,
              qEqBTC: (btcPrice * selectedValue) / result.price,
            }));

            // console.log("Top 100 pairs by market capitalization with USDT:", pairs.slice(0, 100));
            // console.log("Top 50 pairs by market capitalization with USDT:", pairs.slice(100, 50));
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

function createWebSocket() {
  try {
    const ws = new WebSocket(process.env.WEBSOCKET_URL);

    ws.on("open", () => {
      console.log("WebSocket connection opened");
    });

    ws.on("message", (message) => {
      console.log(message);
    });

    ws.on("close", () => {
      console.log("WebSocket connection closed");
    });

    return ws; // return the WebSocket instance
  } catch (error) {
    console.log(error);
    if (maxRetry >= retry) {
      retry++;
      return createWebSocket();
    } else {
      throw error;
    }
  }
}

module.exports = router;
