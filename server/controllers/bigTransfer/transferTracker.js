const WebSocket = require("ws");
const router = require("../newsData/newsData");
const https = require("https");

let lastMessageTime = 0;
router.get("/", async (req, res) => {
  // 2. set coins from step 1 to params.Calculate the quantity equal to btc
  const WebSocket = require("ws");
  const binance = require("binance-api-node").default;
  const coins100 = await get100CoinsByPrice();

  const client = binance();
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
        console.log(msg.s, coin.symbol);
        console.log(msg.q, coin.qEqBTC);
        if (msg.m) {
          console.log(msg.m, "BUY");BTC
        } else {
          console.log("SELL");
        }
      }
    });
    // console.log("large trade!", msg);
    // Process large trade
    lastMessageTime = now;
  });
  // client.websockets.trades(["BTCUSDT"], (trade) => {
  //   // Trade update from REST API
  //   console.log('=>>>>>', trade);
  // });

  //1. Step one take first 100 coins
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
            console.log(sortedPairs)

            const pairs = sortedPairs.map((result) => ({
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

module.exports = router;

// Test from cryptowat
// console.log('yes')
// const API_KEY = "";

// const conn = new WebSocket("wss://stream.cryptowat.ch/connect?apikey=" + API_KEY);

// conn.on("message", function (msg) {
//   const d = JSON.parse(msg.toString());

//   // The server will always send an AUTHENTICATED signal when you establish a valid connection
//   // At this point you can subscribe to resources
//   if (d.authenticationResult && d.authenticationResult.status === "AUTHENTICATED") {
//     console.log("Streaming trades for 1 second...");
//     subscribe(conn, ["markets:*:trades"]);

//     setTimeout(function () {
//       console.log("Unsubscribing...");
//       unsubscribe(conn, ["markets:*:trades"]);
//     }, 1000);
//   }

//   // Market data comes in a marketUpdate
//   // In this case, we're expecting trades so we look for marketUpdate.tradesUpdate
//   if (d.marketUpdate && d.marketUpdate.tradesUpdate) {
//     for (let trade of d.marketUpdate.tradesUpdate.trades) {
//       console.log(
//         `BTC/USD trade on market ${d.marketUpdate.market.marketId}: ${trade.timestampNano} ${trade.priceStr} ${trade.amountStr}`
//       );

//     }
//   }
// });

// // Helper method for subscribing to resources
// function subscribe(conn, resources) {
//   conn.send(
//     JSON.stringify({
//       subscribe: {
//         subscriptions: resources.map((resource) => {
//           return { streamSubscription: { resource: resource } };
//         }),
//       },
//     })
//   );
// }

// function unsubscribe(conn, resources) {
//   conn.send(
//     JSON.stringify({
//       unsubscribe: {
//         subscriptions: resources.map((resource) => {
//           return { streamSubscription: { resource: resource } };
//         }),
//       },
//     })
//   );
// }
