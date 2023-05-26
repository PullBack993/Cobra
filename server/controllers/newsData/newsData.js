const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const router = require("express").Router();
const CronJob = require("cron").CronJob;
puppeteer.use(StealthPlugin());

fetchNews();

router.get("/news", async (req, res) => {
  // 2. Then that
  //  1.2. TODO fetch data from db and return.
  // 1. First implement this.
  //   2.1. TODO Every 3-5min. go to website fetch the news and check the title.
  //   3.1. TODO if title not exist,then go to news,fetch data,add to db.
});

const job = new CronJob(" */3 * * * *", () => {
  // fetchNews();
});

job.start();

async function fetchNews() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  const navigationPromise = page?.waitForNavigation({});
  await page.goto("https://cryptopotato.com/crypto-news/");
  await navigationPromise;

  const newsArray = [];

  const newsData = await page.evaluate(() => {
    const newsItems = document.querySelectorAll(".rpwe-title");
    const newsArray = [];
    newsItems.forEach((item) => {
      newsArray.push(item.innerText);
    });

    return newsArray;
  }, );
  console.log(newsData[0]);
}
module.exports = router;
