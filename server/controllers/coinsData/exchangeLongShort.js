require("dotenv/config");
const router = require("express").Router();
const BtcChangeIndicator = require("../../models/BtcChange");
const fetchNewData = require("../autoUploadBTCReturn/btcReturns");
const fetchNewDataPeriod = require("../autoUploadBTCReturn/btcReturnsPeriod");
const CronJob = require("cron").CronJob;
const axios = require("axios");

// fetchNewData();
// fetchNewDataPeriod();
const job = new CronJob(" 0 */6 * * * ", () => {
  fetchNewData();
  console.log("Fetch daily returns data!");
});

job.start();

router.post("/daily-return", async (req, res) => {
  try {
    const data = req.body;
    let result = {};

    if (data.type === "day") {
      result = await BtcChangeIndicator.find({ TimeFrameName: "Day" }).sort();
    }
    if (data.type === "week") {
      result = await BtcChangeIndicator.find({ TimeFrameName: "Week" });
    }
    if (data.type === "month") {
      result = await BtcChangeIndicator.find({ TimeFrameName: "Month" });
    }
    if (data.type === "quarter") {
      result = await BtcChangeIndicator.find({ TimeFrameName: "Quarter" });
    }
    res.json(result);
  } catch (err) {
    res.json(err, 500);
    console.log("daily return", err);
  }
});


router.post("/long-short", async (req, res) => {
  let { time, coin } = req.body;
  const options = {
    method: 'GET',
    url: `https://open-api.coinglass.com/public/v2/long_short?time_type=${time}&symbol=${coin}`,
    headers: {
      accept: 'application/json',
      coinglassSecret: process.env.COING_KEY
    }
  };
  
  axios
    .request(options)
    .then(function (response) {
      console.log(response.data.data)
      if(response.data.data){
        res.json(response.data.data)
      }else{
        res.json([])
      }
    })
    .catch(function (error) {
      console.error(error);
    });
})


module.exports = router;
