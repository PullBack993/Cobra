const puppeteer = require("puppeteer");
const Cron = require("cron").CronJob;
const router = require("express").Router();
const GainerLosersCoin = require("../../models/GainerLosers");

router.get("/", async (req, res) => {
  try {
    const { timeFrame, category } = req.query;

    if (!timeFrame || !category) {
      return res.status(400).json({ error: "Time frame and category are required" });
    }
    // "http://localhost:3000/api/coins?
    // timeFrame=1h
    // &category=top100";
    const coins = await GainerLosersCoin.find({ timeFrame, category });
       const gainers = coins.filter((item) => item.status === "gainer");
       const losers = coins.filter((item) => item.status === "loser");
    res.json({gainers,losers});
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

async function scrapeData(timeFrame = "24h", category = "all") {
  const browser = await puppeteer.launch({
    headless: 'new',
    protocolTimeout: 240000,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  // Construct the URL based on time frame and category
  let baseUrl = "https://www.coingecko.com/en/crypto-gainers-losers";
  let queryParams = `?time=${timeFrameMapper(timeFrame)}&top=${categoryMapper(category)}`;
  await page.goto(baseUrl + queryParams, { waitUntil: "networkidle2" });

  const data = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("tbody > tr")).map((row) => {
      const icon = row.querySelector(".gecko-up i, .gecko-down i");
      const isGainer = icon && icon.classList.contains("fa-caret-up");
      const isLoser = icon && icon.classList.contains("fa-caret-down");
      return {
        rank: row.children[1].textContent.trim(),
        name: row.querySelector("a").textContent.trim().split('\n')[0],
        symbol: row.querySelector(".tw-text-xs").textContent.trim(),
        logoUrl: row.querySelector("img").src,
        price: row.children[3].textContent.trim(),
        volume: row.children[4].textContent.trim(),
        change: row.children[5].textContent.trim(),
        status: isGainer ? "gainer" : isLoser ? "loser" : "neutral",
      };
    });
  });

  await browser.close();
  return data;
}

function timeFrameMapper(timeFrame) {
  const map = {
    "1h": "h1",
    "24h": "h24",
    "7d": "d7",
    "14d": "d14",
    "30d": "d30",
    "60d": "d60",
    "1y": "y1",
  };
  return map[timeFrame] || "h24";
}

function categoryMapper(category) {
  const map = {
    all: "all",
    top100: "100",
    top300: "300",
    top1000: "1000",
  };
  return map[category] || "all";
}

async function scrapeAndSaveData(timeFrame, category) {
  const scrapedData = await scrapeData(timeFrame, category);

  await GainerLosersCoin.deleteMany({ timeFrame, category });

  await GainerLosersCoin.insertMany(scrapedData.map((item) => ({ ...item, timeFrame, category })));

}

const timeFrames = ["1h", "24h", "7d",'14d', "30d", "60d", "1y"];
const categories = ["all", "top100", "top300", "top1000"];

// Schedule the scraper to run every 5 minutes
const cronJob = new Cron("*/5 * * * *", async () => {
    for (let timeFrame of timeFrames) {
      for (let category of categories) {
        await scrapeAndSaveData(timeFrame, category);
      }
    }
});

cronJob.start();

module.exports = router;
