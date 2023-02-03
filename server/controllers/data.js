const router = require("express").Router();
const CoinGecko = require("coingecko-api");
const Web3 = require("web3");
const { SEARCH_VALUES: searchedTarget } = require("../helpers/utils");
const coinsImages = require("../helpers/coinsImages.json");
const https = require("https");

router.post("/balance", async (req, res) => {
  const address = req.body.name;
  const web3 = new Web3(
    new Web3.providers.HttpProvider("https://mainnet.infura.io/v3/180f2e484a334d569d583c2019619046")
  );
  getBalance(address);

  async function getBalance(address) {
    const balance = await web3.eth.getBalance(address);
    console.log(`Balance of address ${address}:`, web3.utils.fromWei(balance, "ether"));
  }
  https.get("https://api.ipify.org?format=json", (resp) => {
    resp.setEncoding("utf8");
    let userIp = "";
    resp.on("data", (chunk) => {
      userIp += chunk;
      console.log("My public IP address is: " + userIp);
    });
    resp.on("end", () => {
      const parsedData = JSON.parse(userIp);
      const options = {
        path: `/${parsedData.ip}/json/`,
        host: 'ipapi.co',
        port: 443,
        headers: {'User-Agent': 'nodejs-ipapi-v1.02'}
      }
      https.get(options, (resp) => {
        let data = "";
        resp.on("data", (chunk) => {
          data += chunk;
        });
        resp.on("end", () => {
          data = JSON.parse(data)
          console.log(data)
        });
      });
    });
    res.status(200).json({ true: true})
  });

});

router.post("/id", async (req, res) => {
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
        let baseImage = coinsImages.filter((coin) => {
          if (coin.symbol === "USD") return coin.image;
        });
        return res.status(200).json({
          data: [{ base: coinSymbol, price: price, ...target, ...resData, baseImage }],
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
    return res.status(403).json("error", error);
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
    percentage = Math.round((percentage + Number.EPSILON) * 100) / 100;
    price = price || uniqueData[key].last;
    price = formatNumber(price);
    let baseImage = coinsImages.filter((coin) => {
      if (coin.symbol === target) return coin.image;
    });
    return {
      price,
      percentage,
      base,
      baseImage,
      target,
    };
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

module.exports = router;
