const dataController = require("express").Router();
const CoinGecko = require("coingecko-api");

dataController.post("/id", async (req, res) => {
	const CoinGeckoClient = new CoinGecko();
	const coinName = req.body.id;
	const returnCoinsList = {};
	let filtredCoinsMarket = {};
	const searchedTarget = ["BTC", "ETH", "USD", "EUR", "BNB"];

	try {
		let data = await CoinGeckoClient.coins.fetch(coinName);
		// console.log(data.data.market_data.market_cap_change_percentage_24h_in_currency.usd)

		if (data) {
			let coins = data.data.tickers.filter((coin) =>
				searchedTarget.includes(coin.target)
			);

			if (coins.length > 0) {
				filtredCoinsMarket = coins.filter((e) =>
					["Binance", "Bitget"].includes(e.market.name)
				);

				6;
			}

			console.log(filtredCoinsMarket.length);
			let uniqueData = [
				...new Map(
					filtredCoinsMarket.map((coin) => [coin.target, coin])
				).values(),
			];
			console.log(uniqueData.length);

			const percentageData =
				data.data.market_data.market_cap_change_percentage_24h_in_currency;
			const filtered = Object.entries(percentageData)
				.filter(([key]) => ["btc", "usd", "eth", "eur", "bnb"].includes(key))
				.reduce((obj, [key, value]) => {
					obj[key] = value;
					return obj;
				}, {});

			returnCoinsList.image = data.data.image;
			returnCoinsList.symbol = data.data.symbol;
			returnCoinsList.market = uniqueData;
			returnCoinsList.precentage = filtered;

			// res.json(coin);
		} else {
			res.json("");
		}
	} catch (error) {
		console.log(error);
	}
});

module.exports = dataController;
