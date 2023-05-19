require("dotenv/config");
const router = require("express").Router();
const BtcChangeIndicator = require("../../models/BtcChange");
const puppeteer = require("puppeteer");
const fetchNewData = require("../autoUploadBTCReturn/btcReturns");
const fetchNewDataPeriod = require("../autoUploadBTCReturn/btcReturnsPeriod");
const CronJob = require("cron").CronJob;
// fetchNewData();
// fetchNewDataPeriod();
let isRequestDone = true;
let previousSymbol = null;
let previousTime = null;
let page;
let browser;

// fetchNewData();
const job = new CronJob(" 0 */2 * * * ", () => {
  fetchNewData();
  console.log("Running cron job every 2 hours!");
});

job.start();

//TODO remove console logs after all tests
router.post("/long-short", async (req, res) => {
  try {
    if (req.body.exit) {
      if (browser) {
        browser.close();
        browser = null;
      }

      page = null;
      searchedValueOld = "";
      isRequestDone = true;
      return;
    }

    let { time, symbol } = req.body;
    let result = [
      {
        symbol: [],
        symbolLogo: [],
        longRate: [],
        shortRate: [],
        list: [],
      },
    ];
    if (!isRequestDone) {
      console.log("Cancelling previous request...");
      return res.status(400).json({ message: "Previous request is not completed" });
    }
    if (!browser) {
      // { headless: false, defaultViewport: false } for Debugging
      browser = await puppeteer.launch({ headless: false, defaultViewport: false });

      isRequestDone = false;
      console.log("Launching browser...");

      page = await browser.newPage();
      const navigationPromise = page.waitForNavigation();

      console.log("Go to coinglass...");
      await page.goto("https://www.coinglass.com/LongShortRatio");
      await navigationPromise;
    }

    // Check if the current symbol is the same as the previous one
    const shouldChangeSymbol = previousSymbol !== symbol || previousSymbol === null;

    // Check if the current time is the same as the previous one
    const shouldChangeTime = previousTime !== time || previousTime === null;

    (async () => {
      try {
        const inputSelector = ".cg-style-by6qva";

        if (shouldChangeSymbol) {
          previousSymbol = symbol;

          await page.waitForSelector(inputSelector);
          const dropDown = await page.$$(inputSelector);
          await dropDown[1].click(inputSelector); // select coin
          await dropDown[1].type(`${symbol}`);

          await new Promise((resolve) => setTimeout(resolve, 500));
          const firstLiElement = await page.$("ul#\\:R1l9mdqlq6\\:-listbox li:first-child")
          await firstLiElement.click();
          const outSite = await page.$(".cg-style-0");
          await outSite.click();
        }

        if (shouldChangeTime) {
          previousTime = time;
          await page.waitForSelector(".cg-style-co7wrl");
          const dropDownTime = await page.$$(".cg-style-co7wrl");
          if (dropDownTime.length >= 2) {
            await dropDownTime[2].click(".cg-style-co7wrl");
          }
          await page.waitForSelector(".cg-style-1872y3 li");
          const options = await page.$$(".cg-style-1872y3 li");
          for (let i = 0; i < options.length; i++) {
            const optionTitle = await options[i].evaluate((el) => el.textContent);
            if (optionTitle === time) {
              options[i].click();
              await new Promise((resolve) => setTimeout(resolve, 1000));
            }
          }
        }

        const nameWithLogo = await page.evaluate(async (symbol) => {
          const symbolName = document.querySelectorAll(".symbol-name");
          const exchangeLogo = document.querySelectorAll("div.symbol-and-logo img.symbol-logo"); 
          const sName = [];
          const xName = [];
          let beginPush = false;
          for (let i = 0; i < symbolName.length; i++) {
            console.log(symbolName[i]);
            if (symbolName[i].textContent.trim() === symbol && !beginPush) {
              beginPush = true;
            }
            if (beginPush) {
              sName.push(symbolName[i].textContent.trim()); // extract the text content of each element and add to the array
              xName.push(exchangeLogo[i].getAttribute("src"));
            }
          }
          return [sName, xName];
        }, symbol);

        const elements = await page.$$(".cg-style-1si2ck2");
        await Promise.all(
          elements.map(async (element, index) => {
            const firstNumberHandle = await element.evaluateHandle((el) =>
              el.querySelector("div:first-child").textContent.trim()
            );
            const secondNumberHandle = await element.evaluateHandle((el) =>
              el.querySelector("div:last-child").textContent.trim()
            );
            const firstNumber = await firstNumberHandle.jsonValue();
            const secondNumber = await secondNumberHandle.jsonValue();

            result[0].list.push({
              longRate: parseFloat(firstNumber),
              shortRate: parseFloat(secondNumber),
              exchangeLogo: nameWithLogo[1][index],
              exchangeName: nameWithLogo[0][index],
            });
          })
        );

        isRequestDone = true;
        console.log("result =>>>", result[0].list);
        res.status(200).json(result);
        result = [];
      } catch (err) {
        isRequestDone = true;
        console.log(err);
        res.status(500).send("Something went wrong");
        result = [];
      }
    })();
  } catch (err) {
    isRequestDone = true;
    console.error("exchange long short main ==>", err);
    if (browser) {
      await browser.close();
      browser = null;
    }
  }
});

router.post("/daily-return", async (req, res) => {
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
});

module.exports = router;
