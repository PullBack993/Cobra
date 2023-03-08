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
    headers: { accept: "application/json", coinglassSecret: process.env.COING_KEY },
  };
  https.get(options, (response) => {
    let data = "";

    response.on("data", (chung) => {
      data += chung;
    });
    response.on("end", () => {
      res.json(JSON.parse(data));
    });
  });
});

module.exports = router;
