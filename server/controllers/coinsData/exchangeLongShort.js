require("dotenv/config");
const router = require("express").Router();
const BtcChangeIndicator = require("../../models/BtcChange");
const puppeteer = require("puppeteer-extra");
const fetchNewData = require("../autoUploadBTCReturn/btcReturns");
const fetchNewDataPeriod = require("../autoUploadBTCReturn/btcReturnsPeriod");
const CronJob = require("cron").CronJob;
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const { AbortController } = require("abort-controller");
puppeteer.use(StealthPlugin());
const controller = new AbortController();
const signal = controller.signal;
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

async function startBrowser() {
  counter = 0;
  try {
    browser = await puppeteer.launch({
      headless: "new",
      // headless: false,  // Debug purposes only
      args: ["--disable-setuid-sandbox", "--no-sandbox", "--single-process", "--no-zygote"],
      protocolTimeout: 240000,
    });
    console.log("Launching browser...");

    if (!page) {
      page = await browser.newPage();
      const navigationPromise = page?.waitForNavigation({ signal });

      console.log("Go to LONG SHORT...");
      await page.goto(process.env.LONG_SHORT_URL, { timeout: 240000 }, { signal });
      await navigationPromise;
    }
  } catch (error) {
    console.error("daily-returns", error);
    if (counter >= 7) {
      throw new Error(error);
    }
    await startBrowser();
    counter++;
  }
}

setTimeout(() => {
  try {
    startBrowser();
  } catch (error) {
    console.log("daily-return settimeout =>", error);
  }
}, 1000);

//TODO remove console logs after all tests
router.post("/long-short", async (req, res) => {
  try {
    if (req.body.exit) {
      controller.abort();
    }

    let { time, symbol } = req.body;
    let result = [];

    if (!isRequestDone) {
      console.log("Cancelling previous request...");
      return res.status(400).json({ message: "Previous request is not completed" });
    }
    if (!browser || !isRequestDone) {
      isRequestDone = false;
    }

    // Check if the current symbol is the same as the previous one
    const shouldChangeSymbol = previousSymbol !== symbol || previousSymbol === null;

    // Check if the current time is the same as the previous one
    const shouldChangeTime = previousTime !== time || previousTime === null;

    const test = async () => {
      try {
        const inputSelector = ".cg-style-by6qva";
        const dialogElement = await page?.$(".fc-dialog");
        if (dialogElement) {
          // Click on the "Manage options" button.
          const manage = await dialogElement.$$(".fc-button-label");
          console.log("manage", manage[0], manage);
          manage[0].evaluate((el) => el?.click());
        }

        if (shouldChangeSymbol) {
          previousSymbol = symbol;
          await page?.waitForSelector(inputSelector);
          const dropDownSymbol = await page?.$$(inputSelector);
          await dropDownSymbol[1]?.evaluate((b) => b.click());
          await page.keyboard.press("Backspace");
          await page.keyboard.press("Backspace");
          await page.keyboard.press("Backspace");
          await page.keyboard.press("Backspace");
          await page.keyboard.press("Backspace");
          await page.keyboard.press("Backspace");

          await dropDownSymbol[1].type(`${symbol}`);

          await new Promise((resolve) => setTimeout(resolve, 500));

          const liElements = await page.$$("ul#\\:Rqkptaaqm li");
          let matchingLiElement = null;

          for (const liElement of liElements) {
            const text = await page.evaluate((el) => el.textContent.trim(), liElement);
            if (text === symbol) {
              matchingLiElement = liElement;
              break;
            }
          }
          console.log(matchingLiElement);
          if (matchingLiElement) {
            await matchingLiElement.evaluate((b) => b.click());
          } else {
            const firstLiElement = await page.$("ul#\\:Rqkptaaqm\\:-listbox li:first-child");
            await firstLiElement?.evaluate((b) => b?.click());
          }
        }

        const timeSelector = ".cg-style-co7wrl";

        if (shouldChangeTime) {
          previousTime = time;
          await page?.waitForSelector(timeSelector);
          const dropDownTime = await page.$$(timeSelector);
          if (dropDownTime.length >= 2) {
            await dropDownTime[2].evaluate((b) => b.click());
          }
          await page?.waitForSelector(".cg-style-1872y3 li");
          const options = await page.$$(".cg-style-1872y3 li");
          for (let i = 0; i < options.length; i++) {
            const optionTitle = await options[i].evaluate((el) => el.textContent);
            if (optionTitle === time) {
              await options[i].evaluate((b) => b.click());
              await new Promise((resolve) => setTimeout(resolve, 500));
            }
          }
        } else {
          await page?.waitForSelector(timeSelector);
          const dropDownTime = await page.$$(timeSelector);
          if (dropDownTime.length >= 2) {
            await dropDownTime[2].evaluate((b) => b.click());
            await dropDownTime[2].evaluate((b) => b.click());
          }
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
        let nameWithLogo = await getNameWithLogo(page, symbol);

        if (nameWithLogo[0].length <= 0) {
          nameWithLogo = await getNameWithLogo(page, symbol);
        }

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

            result.push({
              longRate: parseFloat(firstNumber),
              shortRate: parseFloat(secondNumber),
              exchangeLogo: nameWithLogo[1][index],
              exchangeName: nameWithLogo[0][index],
            });
          })
        );

        isRequestDone = true;
        res.status(200).json(result);
        result = [];
      } catch (err) {
        isRequestDone = true;
        console.log(err);
        res.status(500).send("Something went wrong");
        result = [];
      }
    };
    await test();
  } catch (err) {
    if (err.name === "AbortError") {
      console.log("Operation aborted by user");
    }
    isRequestDone = true;
    console.error("exchange long short main ==>", err);
    res.status(500).send("Something went wrong");
  }
});

async function getNameWithLogo(page, symbol) {
  try {
    let nameWithLogo = await page.evaluate(async (symbol) => {
      const symbolName = document.querySelectorAll(".symbol-name");
      const exchangeLogo = document.querySelectorAll("div.symbol-and-logo img.symbol-logo");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const sName = [];
      const xName = [];
      let beginPush = false;
      for (let i = 0; i < symbolName.length; i++) {
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
    return nameWithLogo;
  } catch (error) {
    console.error("getNameWithLogo error: " + error);
  }
}

module.exports = router;
