const CoinGecko = require('coingecko-api');
const fs = require('fs');
const CoinGeckoClient = new CoinGecko();
async function test() {
    for (let i = 255; i <= 275; i++){
        let data = await CoinGeckoClient.coins.all({ page: i })
        console.log(data)

          data.data.forEach(element => {
            console.log(element.id)
          const current = {'id': element.id, 'symbol': element.symbol}
          fs.appendFileSync('coins.json', JSON.stringify(current) + ',', (err)=>{console.log(err)})
            
          });
  }
}



// setTimeout(function () {
//     test()
// }, 30000)

const fetchCoins = require('../../coins.json')
console.log(fetchCoins.length)
