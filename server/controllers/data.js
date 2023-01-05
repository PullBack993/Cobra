const dataController = require('express').Router();
const CoinGecko = require('coingecko-api');

dataController.get('/list', async (req, res) => {
  const CoinGeckoClient = new CoinGecko();


 
    let data = await CoinGeckoClient.coins.list();
    console.log(data);
 
});


module.exports = dataController