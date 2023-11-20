const allCoins = require("./coinglass.json");
const { Cluster } = require("puppeteer-cluster");
const puppeteer = require("puppeteer");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

puppeteer.use(StealthPlugin());

// Not used

const longShortJob = new CronJob("*/30 * * * * *", () => {
    getLongShortDataForAllCoins(allCoins);
});

longShortJob.start();

async function getLongShortDataForAllCoins() {
  isEnd = false;

  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_CONTEXT,
    maxConcurrency: 5,
    puppeteerOptions: {
      headless: 'new',
    },
  });

  await cluster.task(async ({ page, data: coin }) => {
    await page.goto(process.env.LONG_SHORT_URL);

    const coinData = await getLongShortData(page, coin);
  });
  for (index; index < allCoins.length; index++) {
    await cluster.queue(allCoins[index]); // Add the coin to the cluster's task queue
  }

  await cluster.idle();
  await cluster.close();
  isEnd = true;
}

async function getLongShortData(page, symbol) {
  try {
    const time = "5 minute";

    let result = [];


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
          manage[0].evaluate((el) => el?.click());
        }

        if (shouldChangeSymbol) {
          previousSymbol = symbol;
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

          await dropDownSymbol[1].type(`${symbol}`);

          await new Promise((resolve) => setTimeout(resolve, 1000));

          const liElements = await page.$$("ul#\\:Rqkptaaqm li");
          let matchingLiElement = null;

          for (const liElement of liElements) {
            const text = await page.evaluate((el) => el.textContent.trim(), liElement);
            if (text === symbol) {
              matchingLiElement = liElement;
              break;
            }
          }
          if (symbol !== "BTC") {
            await page.keyboard.press("ArrowDown");
            await page.keyboard.press("Enter");
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
              await new Promise((resolve) => setTimeout(resolve, 1000));
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

        result = [];
      } catch (err) {
        console.log(err);
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
  }
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
