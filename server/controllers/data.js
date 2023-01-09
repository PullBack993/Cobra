const dataController = require("express").Router();
const CoinGecko = require("coingecko-api");
const fs = require("fs");

dataController.post("/id", async (req, res) => {
  const CoinGeckoClient = new CoinGecko();
console.log(req.body.id)
  const coinName = req.body.id;

  try {
    let data = await CoinGeckoClient.coins.fetch(coinName);
    console.log(data.data)
    res.json(data.data);
  } catch (error) {
    console.log(error);
  }
});

module.exports = dataController;
