const fs = require("fs");
const CoinGecko = require("coingecko-api");

const CoinGeckoClient = new CoinGecko();
let counter = 0;

async function test() {
  let max = 10;
  for (let i = 1; i <= max; i++) {
    let data = await CoinGeckoClient.coins.all({ page: i });
    console.log(counter);
    counter++;
    if (!data.data) {
            await wait();
    }

    data.data.forEach((element) => {
      console.log(element.id);
      const current = { id: element.id, symbol: element.symbol };
      fs.appendFileSync("coins.json", JSON.stringify(current) + ",", (err) => {
        console.log(err);
      });
    });

    if (i % 10 === 0) {
      max += 10;
      await wait()
      console.log(max)
    }
  }
}

async function wait(seconds) {
  console.log("waitttttttttttttttttttttt", new Date().toLocaleTimeString());
  await new Promise((resolve) => setTimeout(resolve, seconds | 60000));
  console.log("gooooooooooooooo ", new Date().toLocaleTimeString());
  
  
}

//TODO take all icon also and set it to search => example img=USD => BTC/USD, img=link BTC/LINK
test();
// const fetchCoins = require('../../coins.json')
// console.log(fetchCoins.length)
