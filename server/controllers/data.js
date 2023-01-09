const dataController = require("express").Router();
const CoinGecko = require("coingecko-api");


dataController.post("/id", async (req, res) => {
  const CoinGeckoClient = new CoinGecko();
console.log(req.body.id)
  const coinName = req.body.id;


  try {
    let data = await CoinGeckoClient.coins.fetch(coinName);
    const searchedTarget = {
      target: 'BTC',
      target: 'ETH'
    }
   const coins =  data.data.tickers.filter((e) => 'BTC ETH'.includes(e.target))
  //  if(coins.length > 0){
  //   coins.filter((e) 'Binance'.includes(e.target))
  //  } 

  data.data.tickers = coins
  // console.log(data.data.tickers)
    res.json(data.data);
  } catch (error) {
    console.log(error);
  }
});

module.exports = dataController;
