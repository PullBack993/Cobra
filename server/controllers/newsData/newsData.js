const puppeteer = require("puppeteer-extra");
const router = require("express").Router();
const CronJob = require("cron").CronJob;

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
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto("https://cryptopotato.com/crypto-news/");
  const newsArray = [];

  const newsData = await page.evaluate(() => {
    const newsItems = document.querySelectorAll(".rpwe-title > a").innerText;
    newsArray.push({ newsItems });
  });
  console.log(newsArray);
}
