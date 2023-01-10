const dataController = require("express").Router();
const CoinGecko = require("coingecko-api");

dataController.post("/id", async (req, res) => {
  const CoinGeckoClient = new CoinGecko();
  console.log(req.body.id);
  const coinName = req.body.id;
  let binance = {};

  try {
    let data = await CoinGeckoClient.coins.fetch(coinName);
    const searchedTarget = ["BTC", "ETH", "USDT", "EUR", "GBP"]
    if (data) {
      let coins = data.data.tickers.filter((e) => searchedTarget.includes(e.target));
      if (coins.length > 0) {
        binance = coins.filter((e) => "Binance" === e.market.name);
      }
  
      data.data.binance = binance;
      console.log(data.data)
      res.json(data.data);
    } else {
      res.json('')
    }
  } catch (error) {
    console.log(error);
  }
});

module.exports = dataController;
