const dataController = require("express").Router();
const CoinGecko = require("coingecko-api");

dataController.post("/id", async (req, res) => {
  const CoinGeckoClient = new CoinGecko();
  const coinSymbol = req.body.symbol.toUpperCase();
  let coinName = req.body.id;
  let searchedTarget = [
    "BTC",
    "ETH",
    "USDT",
    "EUR",
    "BNB",
    "LINK",
    "LTC",
    "XRP",
    "USD",
    "FTM",
    "AVAX",
  ];
  let coins = [];

  try {
    let data = await CoinGeckoClient.coins.fetch(coinName);
    coinName = coinName.toUpperCase();
    if (data) {
      coins = data.data.tickers.filter((coin) => searchedTarget.includes(coin.target));

      coins.filter((marketObj, index) => {
        if (marketObj.base !== coinSymbol) {
          const base = marketObj.base;
          const target = marketObj.target;
          marketObj.base = target;
          marketObj.target = base;
        }
        if (marketObj.base !== coinSymbol && marketObj.target !== coinSymbol) {
          delete coins[index];
          return false;
        }
      });
      let uniqueData = removeDuplicateCoins(coins);
      searchedTarget = searchedTarget.filter((coin) => coin !== coinSymbol.toUpperCase());

      const percentageData = data.data.market_data.market_cap_change_percentage_24h_in_currency;
      const priceData = data.data.market_data.current_price;
      const filterPercentage = Object.entries(percentageData).filter(([key]) =>
        searchedTarget.includes(key.toUpperCase())
      );
      const filterPriceData = Object.entries(priceData).filter(([key]) => 
         searchedTarget.includes(key.toUpperCase())
      );

      let resData = Object.entries(uniqueData).map(([key, { target, base }]) => {
        console.log(target)
        let [, percentage] = filterPercentage.find((k) => k[0] === target.toLowerCase()) || [];
        let [, price] =
          filterPriceData.find((k) => k[0] === target.toLowerCase()) || [];
        console.log(price)
        if (!!price) {
          return {
            price,
            percentage,
            base,
            target,
          };
        }
      });
      console.log(resData.length <= 1)
      if (resData.length <= 1) {
        let price = data.data?.tickers[0]?.converted_last?.usd;
        return res.json({
          ...resData,
          price,
          target: "usd",
          image: data.data.image,
          name: coinName.substring(0, 1).toUpperCase() + coinName.substring(1),
        });
      }
      res.json({
        ...resData,
        image: data.data.image,
        name: coinName.toLowerCase().substring(0, 1).toUpperCase() + coinName.substring(1),
      });
    } else {
      res.json("");
    }
  } catch (error) {
    console.log(error);
      res.json("");

  }
});

function removeDuplicateCoins(coins) {
  let uniqueData = coins.filter(
    (coin, index) => coins.map((c) => c.base + (c.target = c.target === "USDT" ? "USD" : c.target)).indexOf(coin.base + coin.target) === index
  );
  return uniqueData;
}

module.exports = dataController;
