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
let page;
let browser;
let prevSymbol = "";

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
      }
      browser = null;
      page = null;
      searchedValueOld = "";
      isRequestDone = true;
      return;
    }

    console.log(req.body);
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
    if (!isRequestDone && symbol !== prevSymbol && browser) {
      console.log("Cancelling previous request...");
      await browser.close();
      browser = null;
      result = [];
    }
    if (!isRequestDone) {
      console.log("Request in progress, returning...");
      return;
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
    (async () => {
      try {
        // Select symbol (BTC)
        if (prevSymbol !== symbol) {
          prevSymbol = symbol;
          await page.waitForSelector(".cg-style-by6qva");
          const dropDownElements = await page.$$(".cg-style-by6qva");
          if (dropDownElements.length >= 2) {
            await dropDownElements[1].click(".cg-style-by6qva"); // select coin
            await dropDownElements[1].type(`${symbol}`);
            await dropDownElements[1].click(".cg-style-by6qva"); // select coin
          }
          await new Promise((resolve) => setTimeout(resolve, 500));
          await page.keyboard.press("Enter");

          let desiredOption = null;
        }
        // Select time (5minute)
        if (time !== "4 hour") {
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
        //Fetch data
        const nameWithLogo = await page.evaluate(async (symbol) => {
          const symbolName = document.querySelectorAll(".symbol-name");
          const exchangeLogo = document.querySelectorAll("div.symbol-and-logo img.symbol-logo");
          // const longHandler = await page.$$('.cg-style-1si2ck2');
          const sName = [];
          const xName = [];
          let beginPush = false;
          for (let i = 0; i < symbolName.length; i++) {
            if (symbolName[i].textContent.trim() === symbol && !beginPush) { // It is to many symbol
                beginPush = true;
            }
            if(beginPush){
              sName.push(symbolName[i].textContent.trim()); // extract the text content of each element and add to the array
              xName.push(exchangeLogo[i].getAttribute("src"));
              
            }
          }
          return [sName,xName];
        },symbol);


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
        await browser?.close();
        browser = null;
        result = [];
      }
    })();
  } catch (err) {
    isRequestDone = true;
    console.log("exchange long short main ==>", err);
    if (browser) {
      await browser.close();
      browser = null;
    }
  }

  // console.log(req.body);
  // const time = req.body.time;
  // const symbol = req.body.symbol.toUpperCase();
  // const options = {
  //   method: "GET",
  //   hostname: process.env.BASE_URL,
  //   port: null,
  //   path: `/public/v2/long_short?time_type=${time}&symbol=${symbol}`,
  //   headers: { accept: "application/json", coinglassSecret: process.env.COING_KEY },
  // };
  // https.get(options, (response) => {
  //   let data = "";

  //   response.on("data", (chung) => {
  //     data += chung;
  //   });
  //   response.on("end", () => {
  //     console.log(JSON.parse(data));
  //     res.json(JSON.parse(data));
  //   });
  // });
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
