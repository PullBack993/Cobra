const dataController = require("express").Router();
const CoinGecko = require("coingecko-api");
const { SEARCH_VALUES: searchedTarget } = require("../helpers/utils");

dataController.post("/id", async (req, res) => {
  const CoinGeckoClient = new CoinGecko();
  const coinSymbol = req.body.symbol.toUpperCase();
  let coinName = req.body.id;

  try {
    let data = await CoinGeckoClient.coins.fetch(coinName);
    coinName = coinName.toUpperCase();
    if (data && data.data.tickers) {
      // Sometimes data look like target(USD) base(coinName-BTC) -- right is base base(BTC), target(USD).
      let coins = handleReqData(data, coinSymbol);

      // Before remove duplicate,take needed coins.
      coins = data.data.tickers?.filter((coin) => searchedTarget.includes(coin.target));
      let uniqueData = removeDuplicateCoins(coins);

      const percentageData = data.data.market_data.market_cap_change_percentage_24h_in_currency;
      const priceData = data.data.market_data.current_price;
      const filterPercentage = Object.entries(percentageData).filter(([key]) =>
        searchedTarget.includes(key.toUpperCase())
      );
      const filterPriceData = Object.entries(priceData).filter(([key]) =>
        searchedTarget.includes(key.toUpperCase())
      );
      // Preparation for send response.
      let resData = createResponseObj(uniqueData, filterPercentage, filterPriceData);

      if (resData.length <= 1) {
        let price = data.data?.tickers[0]?.converted_last?.usd;
        if (!price) {
          price = data.data.market_data.current_price.usd;
        }
        let target = { target: "USD" };
        return res.status(200).json({
          data: [{ base: coinSymbol, price: price, ...target, ...resData }],
          image: data.data.image,
          name: coinName.toUpperCase().substring(0, 1) + coinName.toLowerCase().substring(1),
        });
      }
      return res.status(200).json({
        data: [...resData],
        image: data.data.image,
        name: coinName.toUpperCase().substring(0, 1) + coinName.toLowerCase().substring(1),
      });
    } else {
      return res.status(204).json("");
    }
  } catch (error) {
    console.log(error);
    return res.status(404).json("error", error);
  }
});

function formatNumber(price) {
  let decimalPart = String(price).split(".");
  if (decimalPart[1]?.length >= 5) {
    return (price = price.toFixed(decimalPart[1].length - 2));
  }
  return price;
}

function createResponseObj(uniqueData, filterPercentage, filterPriceData) {
  let responseData = Object.entries(uniqueData).map(([key, { target, base }]) => {
    let [, percentage] = filterPercentage.find((k) => k[0] === target.toLowerCase()) || [];
    let [, price] = filterPriceData.find((k) => k[0] === target.toLowerCase()) || [];
    price = formatNumber(price);
    percentage = Math.round((percentage + Number.EPSILON) * 100) / 100;
    if (!!price) {
      return {
        price,
        percentage,
        base,
        target,
      };
    }
  });
  return responseData;
}

function handleReqData(data, inputCoinSymbol) {
  let coins = data.data.tickers?.filter((coinsObj, index) => {
    if (coinsObj.base !== inputCoinSymbol) {
      const base = coinsObj.base;
      const target = coinsObj.target;
      coinsObj.base = target;
      coinsObj.target = base;
      return coinsObj;
    }
    if (coinsObj.base !== inputCoinSymbol && coinsObj.target !== inputCoinSymbol) {
      delete data.data.tickers[index];
      return false;
    }
  });
  return coins;
}

function removeDuplicateCoins(coins) {
  let uniqueData = coins?.filter(
    (coin, index) =>
      coins
        .map((c) => c.base + (c.target = c.target === "USDT" ? "USD" : c.target))
        .indexOf(coin.base + coin.target) === index
  );
  return uniqueData;
}

module.exports = dataController;
