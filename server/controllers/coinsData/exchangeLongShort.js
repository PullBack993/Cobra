require("dotenv/config");
const router = require("express").Router();
const https = require("https");
const BtcChangeIndicator = require("../../models/BtcChange");
const puppeteer = require("puppeteer");
const CronJob = require("cron").CronJob;
let isRequestDone = true;
let page;
let browser;
let searchedValueOld = "";

// Create job for every week sunday => sunday
// Create job for every

const job = new CronJob(" 00 00 * * * ", () => {
  fetchNewData();
  console.log("Running cron job at midnight!");
});

const test = new CronJob("*/10 * * * * ", () => {
  console.log("Test server =>>> !");
});

test.start();
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
      // { headless: false, defaultViewport: false }
      browser = await puppeteer.launch();

      isRequestDone = false;
      console.log("Launching browser...");

      page = await browser.newPage();

      console.log("Go to coinglass...");
      await page.goto("https://www.coinglass.com/LongShortRatio");
    }
    (async () => {
      try {
        console.log("test symbol", symbol !== "BTC");
        await page.waitForSelector("#rc_select_2");
        await page.click("#rc_select_2"); // select coin
        await page.type("#rc_select_2", `${symbol}`);
        await new Promise((resolve) => setTimeout(resolve, 500));

        await page.keyboard.press("Enter");
        let desiredOption = null;

        if (time !== "5 minutes") {
          /// check if it 5 min (default) else should select another value
          await page.waitForSelector("#rc_select_3");
          await page.click("#rc_select_3");
          await page.waitForSelector(".ant-select-item.ant-select-item-option");
          const options = await page.$$(".ant-select-item.ant-select-item-option");
          for (let i = 0; i < options.length; i++) {
            const optionTitle = await options[i].getProperty("title");
            const titleValue = await optionTitle.jsonValue();
            await new Promise((resolve) => setTimeout(resolve, 500));
            if (titleValue === time) {
              desiredOption = options[i];
              break;
            }
          }
        }

        if (desiredOption) {
          await desiredOption.click();
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));

        await page.waitForSelector(".bybt-ls-rate");
        console.log("bybt exname");
        const src = await page.$eval(".bybt-exname-logo img", (img) => img.src);
        console.log("src", src);
        const firstNumber = await page.$eval(".bybt-ls-rate div:first-child", (div) =>
          div.textContent.trim()
        );
        const secondNumber = await page.$eval(".bybt-ls-rate div:last-child", (div) =>
          div.textContent.trim()
        );
        result.push({
          symbol: symbol,
          symbolLogo: src,
          longRate: firstNumber,
          shortRate: secondNumber,
          list: [],
        });
        const elements = await page.$$(".bybt-ls-rate");
        console.log("elements", elements);

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
        // }
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
    fetchNewData();

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

async function fetchNewData() {
  // 1. Fetch new Data from coinglass =
  const options = {
    method: "GET",
    hostname: process.env.BASE_URL,
    port: null,
    path: "/public/v2/index/bitcoin_profitable_days",
    headers: { accept: "application/json", coinglassSecret: process.env.COING_KEY },
  };

  let calculatedData = "";
  let fetchedData = "";
  const getData = () => {
    return new Promise((resolve, reject) => {
      https
        .get(options, (response) => {
          let data = "";
          response.on("data", (chunk) => {
            data += chunk;
          });
          response.on("end", () => {
            const parsedData = JSON.parse(data);
            fetchedData = parsedData.data;
            // calculatedData = calculatePercentDifferenceDaily(
            //   parsedData.data,
            //   parsedData.data.length
            // );
            // calculatedData = calculatePercentDifferenceDaily(parsedData.data, parsedData.data.length);
            // calculatedData = calculateWeeklyChanges(parsedData.data, parsedData.data.length);
            calculatedData = calculateMonthlyChanges(parsedData.data, parsedData.data.length);

            // calculatedData = calculateQuarterly(parsedData.data, parsedData.data.length);
            resolve();
          });
        })
        .on("error", (error) => {
          reject(error);
        });
    });
  };

  await getData();
  // updateNewData(calculatedData);
  // updateNewDataWeek(calculatedData, fetchedData);
  updateNewDataMonth(calculatedData);
  // updateNewDataQuarter(calculatedData, fetchedData);
}

function updateNewData(calculatedData) {
  const currentDate = new Date();
  const currentYear = currentDate.getUTCFullYear();
  const currentMonth = currentDate.getUTCMonth() + 1;
  const currentDay = currentDate.getUTCDate();
  console.log("last instance", calculatedData);

  // Check if TimeFrame is Day
  BtcChangeIndicator.findOne(
    {
      name: "BTC",
      TimeFrameName: "Day",
    },
    function (err, btcChangeDoc) {
      if (err) throw err;
      if (btcChangeDoc) {
        // The document exists, update its "Timestamp" field
        const currentTimestamp = btcChangeDoc.Timestamp;
        if (!currentTimestamp.years) {
          // If the "years" array does not exist, create it
          currentTimestamp.years = {};
        }
        if (!currentTimestamp.years[currentYear]) {
          // If the current year object does not exist, create it
          currentTimestamp.years[currentYear] = {};
        }
        if (!currentTimestamp.years[currentYear][currentMonth]) {
          // If the current month object does not exist, create it
          currentTimestamp.years[currentYear][currentMonth] = {};
        }
        currentTimestamp.years[currentYear][currentMonth][currentDay] = calculatedData;
        btcChangeDoc.Timestamp = currentTimestamp;
        btcChangeDoc.markModified("Timestamp"); // Mixed type => mark a field on a doc. as modified (Mongoose doesn't recognize as modification)
        btcChangeDoc.save((error, updatedDoc) => {
          if (error) {
            console.error(error);
            return;
          }
          console.log("Updated document: ", updatedDoc.Timestamp.years["2023"]["5"]); // TODO delete console.logs
        });
      }
    }
  );
}
function updateNewDataWeek(calculatedData, data) {
  const currentData = new Date();
  const currentYear = currentData.getUTCFullYear();
  const currentCountOfWeeks = calculateCountOfWeeks(data);

  BtcChangeIndicator.findOne(
    {
      name: "BTC",
      TimeFrameName: "Week",
    },
    function (err, btcChangeDoc) {
      if (err) throw err;
      if (btcChangeDoc) {
        const currentTimestamp = btcChangeDoc.Timestamp;

        if (!currentTimestamp[currentYear]) {
          currentTimestamp[currentYear] = {};
        }

        if (!currentTimestamp[currentYear][currentCountOfWeeks]) {
          currentTimestamp[currentYear][currentCountOfWeeks] = {};
        }

        currentTimestamp[currentYear][currentCountOfWeeks] = calculatedData;
        btcChangeDoc.Timestamp = currentTimestamp;
        btcChangeDoc.markModified("Timestamp");
        btcChangeDoc.save((error, updatedDoc) => {
          if (error) {
            console.error(error);
            return;
          }
          console.log("Updated document: ", updatedDoc.Timestamp["2023"]); // TODO delete console.logs
        });
      }
    }
  );
}
function updateNewDataMonth(calculatedData) {
  const currentDate = new Date();
  const currentYear = currentDate.getUTCFullYear();
  const currentMonth = currentDate.getUTCMonth() + 1;
  console.log("last instance", calculatedData);

  // Check if TimeFrame is Day
  BtcChangeIndicator.findOne(
    {
      name: "BTC",
      TimeFrameName: "Month",
    },
    function (err, btcChangeDoc) {
      if (err) throw err;
      if (btcChangeDoc) {
        // The document exists, update its "Timestamp" field
        const currentTimestamp = btcChangeDoc.Timestamp;
      
        if (!currentTimestamp[currentYear]) {
          // If the current year object does not exist, create it
          currentTimestamp[currentYear] = {};
        }
        if (!currentTimestamp[currentYear][currentMonth]) {
          // If the current month object does not exist, create it
          currentTimestamp[currentYear][currentMonth] = {};
        }
        currentTimestamp[currentYear][currentMonth] = calculatedData;
        btcChangeDoc.Timestamp = currentTimestamp;
        btcChangeDoc.markModified("Timestamp"); // Mixed type => mark a field on a doc. as modified (Mongoose doesn't recognize as modification)
        btcChangeDoc.save((error, updatedDoc) => {
          if (error) {
            console.error(error);
            return;
          }
          console.log("Updated document: ", updatedDoc); // TODO delete console.logs
        });
      }
    }
  );
}
function updateNewDataQuarter(calculatedData, fetchedData) {
  const currentDate = new Date();
  const currentYear = currentDate.getUTCFullYear();
  const quarter = calculateQuarter(fetchedData);
  console.log("last instance", calculatedData);

  // Check if TimeFrame is Day
  BtcChangeIndicator.findOne(
    {
      name: "BTC",
      TimeFrameName: "Quarter",
    },
    function (err, btcChangeDoc) {
      if (err) throw err;
      if (btcChangeDoc) {
        // The document exists, update its "Timestamp" field
        const currentTimestamp = btcChangeDoc.Timestamp;
        if (!currentTimestamp[currentYear]) {
          // If the current year object does not exist, create it
          currentTimestamp[currentYear] = {};
        }
        if (!currentTimestamp[currentYear][quarter.q]) {
          // If the current month object does not exist, create it
          currentTimestamp[currentYear][quarter.q] = {};
        }
        currentTimestamp[currentYear][quarter.q] = calculatedData;
        btcChangeDoc.Timestamp = currentTimestamp;
        btcChangeDoc.markModified("Timestamp"); // Mixed type => mark a field on a doc. as modified (Mongoose doesn't recognize as modification)
        btcChangeDoc.save((error, updatedDoc) => {
          if (error) {
            console.error(error);
            return;
          }
          console.log("Updated document: ", updatedDoc[currentYear]); // TODO delete console.logs
        });
      }
    }
  );
}

function calculateCountOfWeeks(data) {
  const inputDate = new Date(data[data.length - 1].createTime);
  const yearStart = new Date(inputDate.getFullYear(), 0, 1);
  const timeDiff = inputDate.getTime() - yearStart.getTime();

  return Math.ceil(timeDiff / (1000 * 60 * 60 * 24 * 7));
}

function calculatePercentDifferenceDaily(data, dataLength) {
  const years = {};
  const daily = {};

  for (let i = dataLength - 1; i < dataLength; i++) {
    const date = new Date(data[i].createTime);
    const year = date.getFullYear(); //Mon Aug 16 2010 02:00:00 GMT+0200 (Central European Summer Time)
    const month = date.getMonth() + 1; // 08
    const day = date.getDate(); // 01

    if (!years[year]) {
      years[year] = {};
    }

    if (!data[i - 1]) {
      years[year][day] = {};
      continue;
    }
    if (!years[year][month]) {
      years[year][month] = {};
    }
    const prevPrice = data[i - 1].price;
    const currentPrice = data[i].price;

    const calculatePercentageChange = ((currentPrice - prevPrice) / prevPrice) * 100;
    if (!years[year][month]) {
      years[year][month] = {};
    }
    years[year][month][day] = { difference: calculatePercentageChange };
    daily["difference"] = calculatePercentageChange;
  }
  return daily;
}

function calculateWeeklyDifference(data) {
  const currentDate = new Date(data[data.length - 1].createTime);

  // Calculate the day of the week (0-6, where 0 is Sunday)
  const dayOfWeek = currentDate.getDay();

  // Calculate the count of days from Sunday to the current day
  const daysFromSunday = (dayOfWeek + 8) % 7;

  console.log(`Count of days from Sunday to today: ${daysFromSunday}`);
  return daysFromSunday;
}

function calculateWeeklyChanges(data, dataLength) {
  // cron job to run every sunday.Just then will easy to calculate last week
  const weeklyChanges = {};
  const untilEndWeek = calculateWeeklyDifference(data);
  const inputDate = new Date(data[dataLength - 1].createTime);
  const yearStart = new Date(inputDate.getFullYear(), 0, 1);
  const timeDiff = inputDate.getTime() - yearStart.getTime();

  let weekCounter = Math.ceil(timeDiff / (1000 * 60 * 60 * 24 * 7));

  // let weekCounter = 1; // to take the data of begin for all period of time
  let difference = 0;
  for (let i = dataLength - untilEndWeek; i < data.length; ) {
    // i = 503
    // i = dataLength -7; i < dataLength; => after fill up the DB just increase the value(i) with 7
    console.log(data[i]);
    const date = new Date(data[i].createTime);
    if (!date) {
      return;
    }
    const year = date.getFullYear();

    const weekend = getWeek(date);
    const startOfWeek = weekend.startOfWeek;
    const endOfWeek = weekend.endOfWeek;

    // if (!weeklyChanges[year]) {
    //   weeklyChanges[year] = {};
    //   weekCounter = 1;
    //   weeklyChanges[year][weekCounter] = { difference: 0 };
    // }
    // if (!weeklyChanges[year][weekCounter]) {
    //   weeklyChanges[year][weekCounter] = {
    //     difference: 0,
    //   };
    // }
    let differenceOnDaysBack = 0;
    if (startOfWeek.getDate() <= date.getDate()) {
      differenceOnDaysBack = date.getDate() - startOfWeek.getDate();
    }

    let differenceOnDaysForward = 0;
    if (endOfWeek.getDate() >= date.getDate()) {
      differenceOnDaysForward = endOfWeek.getDate() - date.getDate();
      if (differenceOnDaysForward === 0) {
        differenceOnDaysForward += 7;
      }
    } else {
      const month = date.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      differenceOnDaysForward = daysInMonth - date.getDate() + endOfWeek.getDate();
    }

    //Last week of year(not full) calculate difference
    if (!data[i + differenceOnDaysForward]) {
      differenceOnDaysForward = data.length - i - 1;
    }

    difference =
      ((data[i + differenceOnDaysForward].price - data[i - differenceOnDaysBack].price) /
        data[i - differenceOnDaysBack].price) *
      100;
    // weeklyChanges[year][weekCounter].difference += difference;

    i += differenceOnDaysForward | 7;

    weekCounter += 1;
  }
  console.log(difference);
  return { difference: difference };
}
function calculateQuarter(data) {
  const currentDate = new Date(data[data.length - 1].createTime);

  // Get the current month (0-11)
  const currentMonth = currentDate.getMonth();
  console.log(currentMonth);
  // Calculate the current quarter
  let currentQuarter;
  if (currentMonth >= 0 && currentMonth <= 2) {
    currentQuarter = { q: 1, begin: 0 };
  } else if (currentMonth >= 3 && currentMonth <= 5) {
    currentQuarter = { q: 2, begin: 3 };
  } else if (currentMonth >= 6 && currentMonth <= 8) {
    currentQuarter = { q: 3, begin: 6 };
  } else {
    currentQuarter = { q: 4, begin: 9 };
  }
  return currentQuarter;
}

function calculateQuarterly(data, dataLength) {
  const quarterly = {};
  let difference = {};
  const quarter = calculateQuarter(data);
  const startDate = new Date(new Date().getFullYear(), quarter.begin, 1);

  // Calculate the number of days to the start of the target quarter
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const daysToStart = Math.round((startDate - new Date()) / millisecondsPerDay);

  for (let i = dataLength - Number(Math.abs(daysToStart) - 1); i < data.length; ) {
    let date = new Date(data[i].createTime);
    const year = date.getFullYear();
    const firstDayOfMonth = new Date(year, date.getMonth(), 1);
    let differenceBackDay = 0;

    if (firstDayOfMonth.getDate() !== date.getDate()) {
      differenceBackDay = date.getDate() - firstDayOfMonth.getDate();
      i -= differenceBackDay;
    }
    const quarter = Math.floor(date.getMonth() / 3) + 1;

    const startDate = new Date(year, (quarter - 1) * 3, 1);
    const endDate = new Date(year, quarter * 3, 0);

    let differenceInDays = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (!data[i + differenceInDays]) {
      differenceInDays = data.length - 1 - i;
      isFullQuarter = true;
      console.log(differenceInDays);
    }

    if (!quarterly[year]) {
      quarterly[year] = {};
      quarterly[year][quarter] = { difference: 0 };
    }
    console.log(differenceInDays);
    const startPrice = data[i].price;
    const endPrice = data[i + differenceInDays].price;

    const percentageDifference = calculateDifference(startPrice, endPrice);
    difference = { difference: percentageDifference };
    quarterly[year][quarter] = { difference: percentageDifference };
    i += differenceInDays + 1;
  }
  return difference;
  // return quarterly;
}
function calculateDifferenceFromBeginMonth(data) {
  const currentDate = new Date(data[data.length - 1].createTime);
  const dayOfMonth = currentDate.getDate();
  const daysFromStartOfMonth = dayOfMonth - 2;
  return daysFromStartOfMonth;
}

function calculateMonthlyChanges(data, dataLength) {
  const monthlyChanges = {};
  let difference = {};

  const differenceBeginMonth = calculateDifferenceFromBeginMonth(data);
  for (let i = dataLength - differenceBeginMonth; i < dataLength; ) {
    // const date = new Date(data[i].createTime);
    // if (!data) return;

    // const day = date.getDate();
    // const year = date.getFullYear();
    // const month = date.getMonth() + 1;
    // const daysInMonth = new Date(year, month, 0).getDate();

    // if (!monthlyChanges[year]) {
    //   monthlyChanges[year] = {};
    //   monthlyChanges[year][month] = { difference: 0 };
    // }

    // if (!monthlyChanges[year][month]) {
    //   monthlyChanges[month] = {};
    // }

    // let differenceToNextMonth = daysInMonth; // 27
    // let differenceToBegin = 0;
    // if (day > 1) {
    //   differenceToNextMonth = daysInMonth - day;
    //   differenceToBegin = day - 1;
    // }
    // const lastData = new Date(data[data.length - 1].createTime).getDate();

    // if (daysInMonth > lastData && !data[i + daysInMonth]) {
    //   differenceToNextMonth = lastData - 1;
    // }
    // // if month not full is then should calculate until day today
    // difference =
    //   ((data[i + differenceToNextMonth].price - data[i - differenceToBegin - 1].price) /
    //     data[i - differenceToBegin - 1].price) *
    //   100;
    // monthlyChanges[year][month] = { difference: difference };

    // i += differenceToNextMonth + 1;

    difference = ((data[i + differenceBeginMonth - 1].price - data[i].price) / data[i].price) * 100;
    i += differenceBeginMonth + 1;
  }
  console.log(difference);
  return { difference};
}

function calculateDifference(startPrice, endPrice) {
  return ((endPrice - startPrice) / startPrice) * 100;
}

function getWeek(timestamp) {
  const date = new Date(timestamp);
  const dayOfWeek = date.getDay();
  const startOfWeekTimestamp = timestamp - dayOfWeek * 86400000;
  const endOfWeekTimestamp = startOfWeekTimestamp + 7 * 86400000;
  const startOfWeek = new Date(startOfWeekTimestamp);
  const endOfWeek = new Date(endOfWeekTimestamp);
  return {
    startOfWeek,
    endOfWeek,
  };
}

// async function calculatePercentDifference(data, month, type) {
//   const result = { year: null };
//   let currentDate = null;
//   let currentSum = 0;
//   let currentCount = 0;

//   // Loop through each data point and accumulate the sums
//   for (let i = 0; i < data.length; i++) {
//     const item = data[i];
//     const date = new Date(item.createTime);

//     // Check if the data point is within the desired month
//     if (date.getMonth() + 1 === month) {
//       const value = item.price;

//       // Add the value to the current sum
//       currentSum += value;
//       currentCount++;

//       // Check if the current date has changed
//       if (currentDate === null || type === 'daily' || type === 'weekly' && date.getDay() === 0 || type === 'monthly' && date.getDate() === 1 || type === 'yearly' && date.getMonth() === 0 && date.getDate() === 1) {
//         // Calculate the average value for the previous period
//         if (currentDate !== null) {
//           const average = currentSum / currentCount;
//           result[currentDate] = ((value / average) - 1) * 100;
//         }

//         // Reset the current sum and count
//         currentSum = value;
//         currentCount = 1;

//         // Update the current date
//         if (type === 'daily') {
//           currentDate = date.getDate();
//         } else if (type === 'weekly') {
//           const weekNumber = getWeekNumber(date);
//           currentDate = weekNumber;
//         } else if (type === 'monthly') {
//           currentDate = date.getDate();
//         } else if (type === 'yearly') {
//           currentDate = date.getFullYear();
//         }
//       }
//     }

//     // Update the result year
//     const year = date.getFullYear();
//     if (result.year === null || result.year !== year) {
//       result.year = year;
//     }
//   }

//   // Calculate the average value for the last period
//   const average = currentSum / currentCount;
//   result[currentDate] = ((value / average) - 1) * 100;

//   return result;
// }

// function getWeekNumber(date) {
//   // Copy date so don't modify original
//   date = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
//   // Set to nearest Thursday: current date + 4 - current day number
//   // Make Sunday's day number 7
//   date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay()||7));
//   // Get first day of year
//   var yearStart = new Date(Date.UTC(date.getUTCFullYear(),0,1));
//   // Calculate full weeks to nearest Thursday
//   var weekNo = Math.ceil(( ( (date - yearStart) / 86400000) + 1)/7);
//   // Return array of year and week number
//   return weekNo;
// }

function calculatePercentageChange(data) {
  const years = {};

  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    const date = new Date(item.createTime);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    if (!years[year]) {
      years[year] = { year, month: 1, days: {} };
    }

    const yearData = years[year];
    if (!years[year][month]) {
      years[year] = { year, month: month, days: {} };
    }

    const days = yearData.days;

    if (i > 0) {
      const dayValue = ((data[i - 1].price - item.price) / data[i - 1].price) * 100;
      years[year][day] = dayValue;
    }
  }

  return years;
}

function calculatePriceDifferences(prices) {
  const result = { days: {}, months: {}, years: {} };

  // Create an object with keys for each month and initialize with empty objects
  let monthsObj = {};
  for (let i = 1; i <= 12; i++) {
    monthsObj[i] = {};
  }

  // Initialize variables to keep track of previous price and timestamp
  let prevPrice = null;
  let prevTimestamp = null;

  // Loop through each price object
  prices.forEach((priceObj) => {
    // Get the date object from the timestamp
    const date = new Date(priceObj.createTime);

    // Update day percentage difference
    if (prevPrice !== null && prevTimestamp !== null) {
      const day = date.getDate();
      const prevDate = new Date(prevTimestamp);
      const prevDay = prevDate.getDate();
      const percentDiff = ((priceObj.price - prevPrice) / prevPrice) * 100;
      result.days[date.getMonth() + 1] = {
        ...result.days[date.getMonth() + 1],
        [day]: percentDiff,
      };
      // If the previous day was in a different month, also update the previous month's object
      if (prevDate.getMonth() !== date.getMonth()) {
        result.days[prevDate.getMonth() + 1] = {
          ...result.days[prevDate.getMonth() + 1],
          [prevDay]: ((priceObj.price - prevPrice) / prevPrice) * 100,
        };
      }
    }

    // Update month and year percentage differences
    // if (prevPrice !== null && prevTimestamp !== null) {
    //   const prevDate = new Date(prevTimestamp);
    //   const prevMonth = prevDate.getMonth() + 1;
    //   const prevYear = prevDate.getFullYear();
    //   const monthObj = monthsObj[prevMonth];
    //   const percentDiff = ((priceObj.price - prevPrice) / prevPrice) * 100;
    //   monthObj[prevDate.getDate()] = percentDiff;

    //   if (date.getMonth() !== prevMonth - 1) {
    //     // Previous month was December and current month is January
    //     if (prevMonth === 12 && date.getMonth() === 0) {
    //       result.months[prevMonth] = monthObj;
    //       result.months[date.getMonth() + 1] = {};
    //     } else {
    //       result.months[prevMonth] = monthObj;
    //     }
    //   }
    //   if (prevYear !== date.getFullYear()) {
    //     result.years[prevYear] = monthsObj;
    //     monthsObj = { ...monthsObj };
    //   }
    // }

    // Update previous price and timestamp
    prevPrice = priceObj.price;
    prevTimestamp = priceObj.createTime;
  });

  // Update last day percentage difference
  const lastPriceObj = prices[prices.length - 1];
  const lastDate = new Date(lastPriceObj.createTime);
  const lastDay = lastDate.getDate();
  result.days[lastDate.getMonth() + 1] = {
    ...result.days[lastDate.getMonth() + 1],
    [lastDay]: 0,
  };

  // // Add remaining months to months object
  // monthsObj[lastDate.getMonth() + 1] = {};
  // for (let i = lastDate.getMonth() + 2; i <= 12; i++) {
  //   monthsObj[i] = {};
  // }
  // result.years[lastDate.getFullYear()] = monthsObj;

  return result;
}

module.exports = router;
