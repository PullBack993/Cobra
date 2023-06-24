const WebSocket = require("ws");
const router = require("../newsData/newsData");

// Initialize a connection using your API key
// You can generate an API key here: https://cryptowat.ch/account/api-access
// Paste your API key here:
const API_KEY = "";

router.get("/", async (req, res) => {
    console.log('yes')
  const conn = new WebSocket("wss://stream.cryptowat.ch/connect?apikey=" + API_KEY);

  conn.on("message", function (msg) {
    const d = JSON.parse(msg.toString());

    // The server will always send an AUTHENTICATED signal when you establish a valid connection
    // At this point you can subscribe to resources
    if (d.authenticationResult && d.authenticationResult.status === "AUTHENTICATED") {
      console.log("Streaming trades for 1 second...");
      subscribe(conn, ["markets:*:trades"]);

      setTimeout(function () {
        console.log("Unsubscribing...");
        unsubscribe(conn, ["markets:*:trades"]);
      }, 1000);
    }

    // Market data comes in a marketUpdate
    // In this case, we're expecting trades so we look for marketUpdate.tradesUpdate
    if (d.marketUpdate && d.marketUpdate.tradesUpdate) {
      for (let trade of d.marketUpdate.tradesUpdate.trades) {
        console.log(
          `BTC/USD trade on market ${d.marketUpdate.market.marketId}: ${trade.timestampNano} ${trade.priceStr} ${trade.amountStr}`
        );

      }
    }
  });

  // Helper method for subscribing to resources
  function subscribe(conn, resources) {
    conn.send(
      JSON.stringify({
        subscribe: {
          subscriptions: resources.map((resource) => {
            return { streamSubscription: { resource: resource } };
          }),
        },
      })
    );
  }

  function unsubscribe(conn, resources) {
    conn.send(
      JSON.stringify({
        unsubscribe: {
          subscriptions: resources.map((resource) => {
            return { streamSubscription: { resource: resource } };
          }),
        },
      })
    );
  }
});

module.exports = router;
