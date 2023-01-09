const dataController = require("express").Router();
const CoinGecko = require("coingecko-api");

dataController.post("/id", async (req, res) => {
  const CoinGeckoClient = new CoinGecko();
  console.log(req.body.id);
  const coinName = req.body.id;
  let binance = {};

  try {
    let data = await CoinGeckoClient.coins.fetch(coinName);
    const searchedTarget = {
      target: "BTC",
      target: "ETH",
    };
    let coins = data.data.tickers.filter((e) => "BTC ETH USDT EUR GBP".includes(e.target));
    if (coins.length > 0) {
      binance = coins.filter((e) => "Binance" === e.market.name);
    }

    data.data.binance = binance;
    res.json(data.data);
  } catch (error) {
    console.log(error);
  }
});

module.exports = dataController;
