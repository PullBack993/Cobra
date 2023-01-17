const fs = require('fs');
const CoinGecko = require("coingecko-api");

const CoinGeckoClient = new CoinGecko();



async function test() {
    for (let i = 253; i <= 270; i++){
        let data = await CoinGeckoClient.coins.all({ page: i })
        console.log(data)

          data.data.forEach(element => {
            console.log(element.id)
          const current = {'id': element.id, 'symbol': element.symbol}
          fs.appendFileSync('coins.json', JSON.stringify(current) + ',', (err)=>{console.log(err)})

          });
  }
}


//TODO take all icon also and set it to search => example img=USD => BTC/USD, img=link BTC/LINK

const fetchCoins = require('../../coins.json')
console.log(fetchCoins.length)
