require("dotenv/config");
const fs = require('fs');
const router = require("express").Router();

const JSON_FILE_PATH = './coins.json';

router.get('/list', (req, res) => {
    // Read the JSON file and send it as the API response
    const coinData = JSON.parse(fs.readFileSync(JSON_FILE_PATH, 'utf-8'));
    res.json(coinData);
  });
  
module.exports = router;
