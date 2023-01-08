const dataController = require('express').Router();
const CoinGecko = require('coingecko-api');
const fs = require('fs');

dataController.get('/list', async (req, res) => {
  const CoinGeckoClient = new CoinGecko();


 
  let data = await CoinGeckoClient.coins.fetch('bitcoin');
  fs.writeFile('coins.json', {},  (err)=> {console.log(err)})
 
 
})

module.exports = dataController