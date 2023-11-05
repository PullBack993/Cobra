require("dotenv/config");
const router = require("express").Router();
const BtcChangeIndicator = require("../../models/BtcChange");
const fetchNewData = require("../autoUploadBTCReturn/btcReturns");
const fetchNewDataPeriod = require("../autoUploadBTCReturn/btcReturnsPeriod");
const CronJob = require("cron").CronJob;
const axios = require("axios");

// fetchNewData();
// fetchNewDataPeriod();
const job = new CronJob(" 0 */2 * * * ", () => {
  fetchNewData();
  console.log("Running cron job every 2 hours!");
});

job.start();

router.post("/daily-return", async (req, res) => {
  try {
    const data = req.body;
    const today = new Date();
    const yearDiff = new Array(today.getFullYear() - 2012 + 1).fill(0);
    let result = {};

    if (data.type === "day") {
      const month = data.month;
      const searchParams = {};
      yearDiff.forEach((_, index) => {
        searchParams[`Timestamp.years.${2012 + index}.${month}`] = 1;
      });
      // fetchNewData();

      result = await BtcChangeIndicator.find(
        { [`Timestamp.years.2012.${month}`]: { $exists: true } },
        searchParams
      ).sort();
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
