const dataController = require('express').Router();
const CoinGecko = require('coingecko-api');

dataController.post('/id', async (req, res) => {
  const CoinGeckoClient = new CoinGecko();
  const coinSymbol = req.body.symbol;
  const coinName = req.body.id;
  const returnCoinsList = {};
  let filtredCoinsMarket = {};
  let searchedTarget = ['BTC', 'ETH', 'USDT', 'EUR', 'BNB', 'LINK', 'LTC', 'XRP', 'USD'];
  let coins = [];

  try {
    let data = await CoinGeckoClient.coins.fetch(coinName);
    // console.log(data.data.market_data.market_cap_change_percentage_24h_in_currency.usd)

    if (data) {
      //TODO it check now just 'BTC' but should check also BITCOIN
      coins = data.data.tickers.filter(coin => searchedTarget.includes(coin.target));

      //   if (coins.length > 0) {
      //     filtredCoinsMarket = coins.filter(e =>
      //       ['Binance', 'Bitget', 'OKX', 'Kraken', 'WhiteBIT'].includes(e.market.name)
      //     );
      //     // console.log(coins)
      //   }
      //   console.log(filtredCoinsMarket)
      

		let uniqueData = removeDuplicateCoins(coins);
      searchedTarget = searchedTarget.filter(coin => coin !== coinSymbol.toUpperCase());
		
		//Check this function !!! it doesn't work properly
		  uniqueData.filter(marketObj => {
        marketObj.name = coinName;
        if (marketObj.target === coinName) {
          element.target = marketObj.base;
        }
      });

      const percentageData = data.data.market_data.market_cap_change_percentage_24h_in_currency;
      const filtredPercentage = Object.entries(percentageData).filter(([key]) =>
        searchedTarget.includes(key.toUpperCase())
      );

		//todo check this too
      uniqueData.forEach(marketObj => {
        filtredPercentage.forEach((element, index) => {
          if (element[0] === marketObj.target.toLowerCase()) {
            uniqueData.percentage = element[1];
          }
        });
      });

      // console.log(uniqueData)

      returnCoinsList.image = data.data.image;
      returnCoinsList.symbol = data.data.symbol;
      returnCoinsList.market = uniqueData;
      returnCoinsList.percentage = filtredPercentage;

      res.json(returnCoinsList);
    } else {
      res.json('');
    }
  } catch (error) {
    console.log(error);
  }
});

function removeDuplicateCoins(coins) {
  let uniqueData = coins.filter(
    (coin, index) => coins.map(c => c.base + c.target).indexOf(coin.base + coin.target) === index
  );
  return uniqueData;
}
module.exports = dataController;
