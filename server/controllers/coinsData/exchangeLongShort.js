require("dotenv/config");
const router = require("express").Router();
const https = require("https");

router.post("/long-short", async (req, res) => {
  console.log(req.body);
  const time = req.body.time;
  const symbol = req.body.symbol.toUpperCase();
  const options = {
    hostname: process.env.BASE_URL,
    port: null,
    path: `/public/v2/long_short?time_type=${time}&symbol=${symbol}`,
    headers: {   accept: 'application/json', coinglassSecret: "233f9d28b54f4a5e8f86c849035aef1a" },
  };
  https.get(options, (response) => {
    let data = "";

    response.on("data", (chung) => {
      data += chung;
    });
    response.on("end", () => {
      console.log(data);
      res.json(data)
    });
  });
});

module.exports = router;