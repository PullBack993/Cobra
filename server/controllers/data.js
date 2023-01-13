const dataController = require("express").Router();
const CoinGecko = require("coingecko-api");

dataController.post("/id", async (req, res) => {
  const CoinGeckoClient = new CoinGecko();
  const coinSymbol = req.body.symbol;
  const coinName = req.body.id;
  const returnCoinsList = {};
  let filtredCoinsMarket = {};
  let searchedTarget = ["BTC", "ETH", "USDT", "EUR", "BNB", "LINK", "LTC", "XRP", "USD"];
  let coins = [];

  try {
    let data = await CoinGeckoClient.coins.fetch(coinName);
    if (data) {
      //TODO it check now just 'BTC' but should check also BITCOIN
      coins = data.data.tickers.filter((coin) => searchedTarget.includes(coin.target));

      let uniqueData = removeDuplicateCoins(coins);
      searchedTarget = searchedTarget.filter((coin) => coin !== coinSymbol.toUpperCase());

      uniqueData.filter((marketObj) => {
        //TODO if we bitcoin or btc it should allway take btc from input
        if (marketObj.base !== coinSymbol) {
          const base = marketObj.base;
          const target = marketObj.target;
          marketObj.base = target;
          marketObj.target = base;
        }
      });

      const percentageData = data.data.market_data.market_cap_change_percentage_24h_in_currency;
      const priceData = data.data.market_data.current_price;
      const filtredPercentage = Object.entries(percentageData).filter(([key]) =>
        searchedTarget.includes(key.toUpperCase())
      );
      const filtredPriceData = Object.entries(priceData).filter(([key]) =>
        searchedTarget.includes(key.toUpperCase())
      );

      let resData = Object.entries(uniqueData).map(([key, value]) => {
        let percentage = filtredPercentage.find((el) => el[0] === value.target.toLowerCase());
        let price = filtredPriceData.find((el) => el[0] === value.target.toLowerCase());
        return {
          base: value.base,
          target: value.target,
          price: price ? price[1] : null,
          percentage: percentage ? percentage[1] : null,
        };
      });
      resData = { ...resData, image: data.data.image };

      res.json(resData);
    } else {
      res.json("");
    }
  } catch (error) {
    console.log(error);
  }
});

function removeDuplicateCoins(coins) {
  let uniqueData = coins.filter(
    (coin, index) => coins.map((c) => c.base + c.target).indexOf(coin.base + coin.target) === index
  );
  return uniqueData;
}
module.exports = dataController;
