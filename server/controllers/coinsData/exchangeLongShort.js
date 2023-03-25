require("dotenv/config");
const router = require("express").Router();
const { truncateSync } = require("fs");
const https = require("https");
const BtcChangeIndicator = require("../../models/BtcChange");
const puppeteer = require("puppeteer");
let isRequestDone = true;

router.post("/long-short", async (req, res) => {
  console.log("request made");
  if (!isRequestDone) {
    return;
  }
  let a = (async () => {
    try {
      isRequestDone = false;
      const browser = await puppeteer.launch();
      const page = await browser.newPage();

      await page.goto("https://www.coinglass.com/LongShortRatio");

      await page.click("#rc_select_2");
      await page.type("#rc_select_2", "GALA");

      await page.keyboard.press("Enter");
      await page.waitForTimeout(800);

      await page.waitForSelector(".bybt-ls-rate");

      const elements = await page.$$(".bybt-ls-rate");

      const numbers = await Promise.all(
        elements.map(async (element) => {
          const firstNumberHandle = await element.evaluateHandle((el) =>
            el.querySelector("div:first-child").textContent.trim()
          );
          const secondNumberHandle = await element.evaluateHandle((el) =>
            el.querySelector("div:last-child").textContent.trim()
          );
          const firstNumber = await firstNumberHandle.jsonValue();
          const secondNumber = await secondNumberHandle.jsonValue();
          return [parseFloat(firstNumber), parseFloat(secondNumber)];
        })
      );

      console.log(numbers); // should output an array of arrays containing the parsed numbers
      isRequestDone = true;

      await browser.close();
    } catch (err) {
      console.log(err);
    }
  })();
  res.json("");

  // console.log(req.body);
  // const time = req.body.time;
  // const symbol = req.body.symbol.toUpperCase();
  // const options = {
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

    result = await BtcChangeIndicator.find(
      { [`Timestamp.years.2012.${month}`]: { $exists: true } },
      searchParams
    );
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

function calculateQuarterly(data) {
  const quarterly = {};

  for (let i = 503; i < data.length; ) {
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
    console.log("startDate", new Date(data[i].createTime));
    console.log("endDate", new Date(data[i + differenceInDays].createTime));
    const startPrice = data[i].price;
    const endPrice = data[i + differenceInDays].price;

    const percentageDifference = calculateDifference(startPrice, endPrice);
    quarterly[year][quarter] = { difference: percentageDifference };
    i += differenceInDays + 1;
  }
  console.log(quarterly);
  return quarterly;
}

function calculateDifference(startPrice, endPrice) {
  return ((endPrice - startPrice) / startPrice) * 100;
}

function calculateMonthlyChanges(data) {
  const monthlyChanges = {};

  for (let i = 503; i < data.length; ) {
    const date = new Date(data[i].createTime);
    if (!data) return;

    const day = date.getDate();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const daysInMonth = new Date(year, month, 0).getDate();

    if (!monthlyChanges[year]) {
      monthlyChanges[year] = {};
      monthlyChanges[year][month] = { difference: 0 };
    }

    if (!monthlyChanges[year][month]) {
      monthlyChanges[month] = {};
    }

    let differenceToNextMonth = daysInMonth; // 27
    let differenceToBegin = 0;
    if (day > 1) {
      differenceToNextMonth = daysInMonth - day;
      differenceToBegin = day - 1;
    }
    const lastData = new Date(data[data.length - 1].createTime).getDate();

    if (daysInMonth > lastData && !data[i + daysInMonth]) {
      differenceToNextMonth = lastData - 1;
    }
    console.log("next", data[i + differenceToNextMonth].price);
    console.log("before", data[i - differenceToBegin - 1].price);
    // if month not full is then should calculate until day today
    const difference =
      ((data[i + differenceToNextMonth].price - data[i - differenceToBegin - 1].price) /
        data[i - differenceToBegin - 1].price) *
      100;
    monthlyChanges[year][month] = { difference: difference };

    i += differenceToNextMonth + 1;
  }
  return monthlyChanges;
}

function calculateWeeklyChanges(data) {
  const weeklyChanges = {};
  let weekCounter = 1;

  for (let i = 503; i < data.length; ) {
    // 869 begin 2013 => 4521 1.1.2023

    const date = new Date(data[i].createTime);
    if (!date) {
      return;
    }
    const year = date.getFullYear();

    const weekend = getWeek(date);
    const startOfWeek = weekend.startOfWeek;
    const endOfWeek = weekend.endOfWeek;

    if (!weeklyChanges[year]) {
      weeklyChanges[year] = {};
      weekCounter = 1;
      weeklyChanges[year][weekCounter] = { difference: 0 };
    }
    if (!weeklyChanges[year][weekCounter]) {
      weeklyChanges[year][weekCounter] = {
        difference: 0,
      };
    }
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

    const difference =
      ((data[i + differenceOnDaysForward].price - data[i - differenceOnDaysBack].price) /
        data[i - differenceOnDaysBack].price) *
      100;
    weeklyChanges[year][weekCounter].difference += difference;

    i += differenceOnDaysForward | 7;

    weekCounter += 1;
  }

  return weeklyChanges;
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

function calculatePercentDifferenceDaily(data, type) {
  const years = {};

  for (let i = 503; i < data.length; i++) {
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
  }
  // if (monthIndex === parseInt(month) && type === "daily") {
  //   if (currentYear === null) {
  //     currentYear = year;
  //     currentMonth = monthIndex;
  //   }

  //   if (year !== currentYear || monthIndex !== currentMonth) {
  //     // reached the end of the month
  //     days[currentDay] = (lastPrice - data[currentDay - 2].price) / data[currentDay - 2].price;

  //     // reset for next month
  //     currentYear = year;
  //     currentMonth = monthIndex;
  //     currentDay = 1;
  //     lastPrice = null;
  //   }

  //   if (lastPrice !== null) {
  //     days[currentDay] = (item.price - lastPrice) / lastPrice;
  //   }

  //   lastPrice = item.price;
  //   currentDay++;
  // }
  return {
    years,
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
