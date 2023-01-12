const dataController = require("express").Router();
const CoinGecko = require("coingecko-api");

dataController.post("/id", async (req, res) => {
  const CoinGeckoClient = new CoinGecko();
  const coinName = req.body.id;
  const coin = {};
  let binance = {};

  try {
    let data = await CoinGeckoClient.coins.fetch(coinName);
    const searchedTarget = ["BTC", "ETH", "USDT", "EUR", "BNB"];
    if (data) {
      let coins = data.data.tickers.filter((e) =>
        searchedTarget.includes(e.target)
      );
      if (coins.length > 0) {
        binance = coins.filter((e) =>
          ["Binance", "Bitget"].includes(e.market.name)
        );
      }

      let uniqueData = [...new Map(binance.map((o) => [o.target, o])).values()];

      const percentageData =
        data.data.market_data["price_change_24h_in_currency"];
      const filtered = Object.entries(percentageData)
        .filter(([key]) => ["btc", "usd", "eth", "eur", "bnb"].includes(key))
        .reduce((obj, [key, value]) => {
          obj[key] = value;
          return obj;
        }, {});

      uniqueData.forEach(function (coin) {
        if ("usd" in filtered) {
          filtered.usdt = filtered.usd;
          delete filtered.usd;
        }
        if (Object.keys(filtered).includes(coin.target.toLowerCase())) {
          console.log(filtered);
          coin.percent = filtered[coin.target.toLowerCase()];
        }
      });

      console.log(uniqueData);

      coin.image = data.data.image;
      coin.symbol = data.data.symbol;
      coin.dailyPercentage = filtered;
      coin.market = uniqueData;

      res.json(coin);
    } else {
      res.json("");
    }
  } catch (error) {
    console.log(error);
  }
});

module.exports = dataController;
