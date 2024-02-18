const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const CronJob = require("cron").CronJob;
const router = require("express").Router();
const { updateData } = require("./store");
const { emitData } = require("./lonshShortWS");
puppeteer.use(StealthPlugin());

const wantedCoins = [
  "BTC",
  "ETH",
  "SOL",
  "XRP",
  "ADA",
  "AVAX",
  "DOGE",
  "LINK",
  "TRX",
  "DOT",
  "MATIC",
  "LTC",
  "ETC",
  "APT",
  "INJ",
  "OP",
  "KAS",
  "ARB",
  "ATOM",
];

const scrapeLongShort = new CronJob("*/10 * * * *", () => {
  const timeNow = new Date();
  console.log(
    "Start sraping",
    timeNow.getHours() + ":" + timeNow.getMinutes() + ":" + timeNow.getSeconds()
  );
  startBrowser();
});
scrapeLongShort.start();

async function startBrowser() {
  counter = 0; // retry browser
  try {
    const browser = await puppeteer.launch({
      headless: "new",
      // headless: false, // Debug purposes only
      args: ["--disable-setuid-sandbox", "--no-sandbox", "--single-process", "--no-zygote"],
      protocolTimeout: 240000,
    });
    console.log("Launching browser...");
    const page = await browser.newPage();
    await page.goto(
      process.env.LONG_SHORT_URL,
      { timeout: 240000 },
      { waitUntil: "domcontentloaded" }
    );
    await configurateCoinTime(page);
    await browser.close();
  } catch (error) {
    console.error("daily-returns", error);
    if (counter >= 7) {
      throw new Error(error);
    }
    await startBrowser();
    counter++;
  }
}

async function configurateCoinTime(page) {
  for (const coin of wantedCoins) {
    let result = [];
    try {
      // 1. Cookies accept
      await acceptCookies(page);
      // 2. Dropdown Coin5r
      await changeCoin(page, coin);
      const timeNow = new Date();

      // 3. Dropdown Time
      await changeTime(page);
      // 4. Get name and logo
      await page.waitForTimeout(1000);
      let nameWithLogo = await getNameWithLogo(page, coin);

      if (nameWithLogo[0]?.length <= 0) {
        nameWithLogo = await getNameWithLogo(page, coin);
      }
      // 5. Get long short data?
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
            timestamp: Date.now(),
          });
        })
      );
      // save and emit data to ws
      const coinData = await updateData(result[0], result);
      if (coinData) {
        emitData(coinData);
      }
      result = [];
    } catch (err) {
      console.log("Fail scraping long-short ration", err);
      result = [];
    }
  }
}

async function acceptCookies(page) {
  const dialogElement = await page?.$(".fc-dialog");
  if (dialogElement) {
    // Click on the "Manage options" button.
    const manage = await dialogElement.$$(".fc-button-label");
    manage[0].evaluate((el) => el?.click());
  }
}

async function changeCoin(page, coin) {
  if (coin !== "BTC") {
    const inputSelector = ".cg-style-phfqk";
    await page?.waitForSelector(inputSelector);
    const dropDownSymbol = await page?.$$(inputSelector);
    if (dropDownSymbol) {
      await dropDownSymbol[1]?.evaluate((b) => b.click());
    }
    await page.keyboard.press("Backspace");
    await page.keyboard.press("Backspace");
    await page.keyboard.press("Backspace");
    await page.keyboard.press("Backspace");
    await page.keyboard.press("Backspace");
    await page.keyboard.press("Backspace");

    await dropDownSymbol[1].type(`${coin}`);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const liElements = await page.$$(".cg-style-1fwlt2m");
    let matchingLiElement = null;

    for (const liElement of liElements) {
      const text = await page.evaluate((el) => el.textContent.trim(), liElement);
      if (text === coin) {
        matchingLiElement = liElement;
        break;
      }
    }
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
  }
}

async function changeTime(page) {
  const timeSelector = ".cg-style-1qmzz5g";

  await page?.waitForSelector(timeSelector);
  const dropDownTime = await page.$$(timeSelector);
  await dropDownTime[3].click();

  const fiveMinute = await page.$$(".cg-style-1829snp");
  await fiveMinute[3].click();
}

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
          xName.push(exchangeLogo[i]?.getAttribute("src"));
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
