const CoinGecko = require('coingecko-api');
const fs = require('fs');
const CoinGeckoClient = new CoinGecko();
let begin = 1
let max = 19
let currentLoop = 1
async function test() {

    setTimeout(async function () {
    for (let i = begin; i <= max; i++){

   let data = await CoinGeckoClient.coins.all({ page: i })
        readData(data)
         begin += 20
    max += 19
}
}, 60000)

}

        test()
     
function readData(data) {
         try {
            data.data.forEach(element => {
              console.log(element.id)
            const current = {'id': element.id, 'symbol': element.symbol}
            fs.appendFileSync('coins.json', JSON.stringify(current) + ',', (err)=>{console.log(err)})
            });
            
        } catch (err) {
            console.log(err)
    }
    if (currentLoop < 13) {
        test()
        currentLoop++
    }

}


const fetchCoins = require('../../coins.json')
console.log(fetchCoins.length)
