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

// trade =>>> {
//     externalId: 'MINATRY:2788405',
//     timestamp: '1687463548',
//     timestampNano: '1687463548795000000',
//     priceStr: '12.05',
//     amountStr: '620',
//     amountBaseStr: '620',
//     amountQuoteStr: '7471',
//     amountContractsStr: '0',
//     amountSettlementStr: '0',
//     amountUSDStr: '300.4266734330692467',
//     orderSide: 'BUYSIDE'
// }
// trade =>>> {
//     externalId: '5830100007',
//     timestamp: '1687463548',
//     timestampNano: '1687463548962000000',
//     priceStr: '3.53843',
//     amountStr: '97.34',
//     amountBaseStr: '97.34',
//     amountQuoteStr: '344.4307762',
//     amountContractsStr: '0',
//     amountSettlementStr: '0',
//     amountUSDStr: '344.30239293470690152',
//     orderSide: 'SELLSIDE'
//   }
//   trade =>>> {
//     externalId: 'ETCUSDT:362523380',
//     timestamp: '1687463548',
//     timestampNano: '1687463548747000000',
//     priceStr: '16.819',
//     amountStr: '87.83',
//     amountBaseStr: '87.83',
//     amountQuoteStr: '1477.21277',
//     amountContractsStr: '87.83',
//     amountSettlementStr: '1477.21277',
//     amountUSDStr: '1476.662153121225092',
//     orderSide: 'BUYSIDE'
//   }