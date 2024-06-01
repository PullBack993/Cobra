require("dotenv/config");
const router = require("express").Router();
const { CoinGeckoClient } = require("coingecko-api-v3");
const axios = require("axios");
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());
const CronJob = require("cron").CronJob;

const coingeckoClient = new CoinGeckoClient({
  timeout: 10000,
  autoRetry: true,
});

let trendingCoinsCache = {
  coins: [],
  timestamp: 0,
};

router.get("/", async (req, res) => {
  try {
    const all = await getTrendingCoins();
    res.json(all);
  } catch (error) {
    console.log("Trending endpoint error", error);
  }
});

async function getTrendingCoins() {
  try {
    const currentTime = Date.now();

    // Check if cache is expired (5 minutes)
    if (currentTime - trendingCoinsCache.timestamp > 5 * 60 * 1000) {
      const trendingSearch = await coingeckoClient.trending();
      for (const coin of trendingSearch.coins) {
        const coinId = coin.item.id;
        const options = {
          method: "GET",
          url: `https://api.coingecko.com/api/v3/coins/${coinId}?tickers=false&community_data=false&developer_data=false&sparkline=true`,
          headers: {
            accept: "application/json",
            "x-cg-demo-api-key": process.env.COINGECKO_KEY,
          },
        };

        try {
          // Fetch additional data for each coin
          const response = await axios.request(options);
          coin.additionalData = response.data;
        } catch (error) {
          console.error(error);
          // fallback
          const coinData = await coingeckoClient.coinId({
            id: coinId,
            localization: false,
            sparkline: true,
            developer_data: false,
          });
          coin.additionalData = coinData;
        }
      }
      // Update cache with new data and timestamp
      trendingCoinsCache = {
        coins: trendingSearch.coins,
        timestamp: currentTime,
      };
      return trendingCoinsCache;
    } else {
      return trendingCoinsCache;
    }
  } catch (error) {
    console.error(error);
  }
}


module.exports = router;
