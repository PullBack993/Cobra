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
let searchedValueOld = "";

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
    let result = [];

    if (!isRequestDone && symbol !== searchedValueOld && browser) {
      console.log("Cancelling previous request...");
      await browser.close();
      browser = null;
      result = [];
    }

    if (!isRequestDone && symbol === searchedValueOld) {
      console.log("Request in progress, returning...");
      return;
    }
    searchedValueOld = symbol;
    console.log("....");
    console.log(browser);
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
        await page.waitForSelector(".cg-style-by6qva");
        const dropDownElements = await page.$$(".cg-style-by6qva");
        if (dropDownElements.length >= 2) {
          await dropDownElements[1].click(".cg-style-by6qva"); // select coin
          await dropDownElements[1].type(`${symbol}`);
          await dropDownElements[1].click(".cg-style-by6qva"); // select coin
        }
        await new Promise((resolve) => setTimeout(resolve, 700));
        await page.keyboard.press("ArrowDown");
        await page.keyboard.press("Enter");

        let desiredOption = null;

        if (time !== "4 hour") {
          await page.waitForSelector(".cg-style-co7wrl");
          const dropDownTime = await page.$$(".cg-style-co7wrl");
          if (dropDownTime.length >= 2) {
            await dropDownTime[2].click(".cg-style-co7wrl");
          }
          await page.waitForSelector(".cg-style-1872y3 li");
          const options = await page.$$(".cg-style-1872y3 li");
          for (let i = 0; i < options.length; i++) {
            const optionTitle = await options[i].evaluate(el => el.textContent);
            if(optionTitle === time){
              options[i].click()
              console.log(optionTitle)
              await new Promise((resolve) => setTimeout(resolve, 1000));
            }
          }
        }


        // console.log("bybt exname");
        // const src = await page.$eval(".symbol-logo img", (img) => img.src);
        // console.log("src", src);
        // const firstNumber = await page.$eval(".bybt-ls-rate div:first-child", (div) =>
        //   div.textContent.trim()
        // );
        // const secondNumber = await page.$eval(".bybt-ls-rate div:last-child", (div) =>
        //   div.textContent.trim()
        // );
        // result.push({
        //   symbol: symbol,
        //   symbolLogo: src,
        //   longRate: firstNumber,
        //   shortRate: secondNumber,
        //   list: [],
        // });

        const titles = await page.evaluate(() => {
          const elements = document.querySelectorAll(".bybt-font-normal"); // get all elements with class name 'bybt-font-normal'
          const values = [];
          for (let i = 0; i < elements.length; i++) {
            values.push(elements[i].textContent.trim()); // extract the text content of each element and add to the array
          }
          return values;
        });

        const exchanges = await page.$$eval(".bybt-font-normal", (elements) =>
          elements.map((el) => el.textContent.trim())
        );
        console.log(exchanges);

        const exchangeLogos = await page.$$eval("div.shou div.bybt-exname-logo > img", (imgs) =>
          imgs.map((img) => img.getAttribute("src"))
        );
        console.log(exchangeLogos);

        await Promise.all(
          elements.map(async (element, index) => {
            if (index === 0) return;
            console.log("in promise all");

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
              exchangeLogo: exchangeLogos[index - 1],
              exchangeName: titles[index],
            });
          })
        );

        // console.log(numbers); // should output an array of arrays containing the parsed numbers
        isRequestDone = true;
        console.log("result =>>>", result);
        res.status(200).json(result);
        // if (browser) {
        //   await browser.close();
        //   browser = null;
        // }
        // browserActive = false;
        // if (browser) {
        //   await browser.close();
        //   browser = null;
        // isRequestDone = true;

        // // }
        result = [];
      } catch (err) {
        isRequestDone = true;
        console.log(err);
        res.status(500).send("Something went wrong");
        // if (browser) {
        //   await browser.close();
        //   browser = null;
        // }
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
