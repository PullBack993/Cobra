const fs = require("fs");
const CoinGecko = require("coingecko-api");

const CoinGeckoClient = new CoinGecko();
let max = 10;

async function test() {
  for (let i = 1; i <= max; i++) {
    try {
      let data = await CoinGeckoClient.coins.all({ page: i });
      if (!data.data) {
        await wait(6000);
      }

      data.data.forEach((element) => {
        console.log(element.image);
        const current = { id: element.id, symbol: element.symbol, image: element.image.small };
        fs.appendFileSync("coins.json", JSON.stringify(current) + ",", (err) => {
          console.log(err);
        });
      });
      if (max >= 240) {
        max += 5;
        await wait();
      } else {
        max += 10;
        await wait();
      }
    } catch (err) {
      console.log(err);
      if (max >= 270) {
        break;
      }
      continue;
    }
  }
}
let SEARCH_VALUES = [
  "bitcoin",
  "ethereum",
  "tether",
  "euro",
  "binancecoin",
  "chainlink",
  "litecoin",
  "ripple",
  "fantom",
  "avalanche",
];

function takeNeeded(data) {
  data.forEach((el) => {
    if (SEARCH_VALUES.includes(el.id)) {
      console.log(el);
      fs.appendFileSync("coinsNeeded.json", JSON.stringify(el) + ",", (err) => {});
    }
  });
}

async function wait(seconds) {
  console.log("waitttttttttttttttttttttt", new Date().toLocaleTimeString());
  await new Promise((resolve) => setTimeout(resolve, seconds | 120000));
  console.log("gooooooooooooooo ", new Date().toLocaleTimeString());
}

// test();
// takeNeeded(fetchCoins);
const fetchCoins = require("../../coins.json");
console.log(fetchCoins.length);
