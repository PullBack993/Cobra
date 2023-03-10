require("dotenv/config");
const router = require("express").Router();
const https = require("https");

router.post("/long-short", async (req, res) => {
  console.log(req.body);
  const time = req.body.time;
  const symbol = req.body.symbol.toUpperCase();
  const options = {
    hostname: process.env.BASE_URL,
    port: null,
    path: `/public/v2/long_short?time_type=${time}&symbol=${symbol}`,
    headers: { accept: "application/json", coinglassSecret: process.env.COING_KEY },
  };
  https.get(options, (response) => {
    let data = "";

    response.on("data", (chung) => {
      data += chung;
    });
    response.on("end", () => {
      res.json(JSON.parse(data));
    });
  });
});

router.get("/daily-return", async (req, res) => {
  const options = {
    method: "GET",
    hostname: process.env.BASE_URL,
    port: null,
    path: "/public/v2/index/bitcoin_profitable_days",
    headers: { accept: "application/json", coinglassSecret: process.env.COING_KEY },
  };
  https.get(options, (response) => {
    let data = "";

    response.on("data", (chung) => {
      data += chung;
    });
    response.on("end", () => {
      // console.log(JSON.parse(data))
      const parseData = JSON.parse(data);
      const generatedData = calculateWeeklyChanges(parseData.data, 1, "daily");
      console.log(generatedData);
      res.json(generatedData);
    });
  });
});



function calculateWeeklyChanges(data) {
  // Create an object to store the weekly changes
  const weeklyChanges = {};
  let weekCounter = 1;

  // Loop through the data
  for (let i = 138; i < data.length; ) {
    // Get the date from the timestamp
    const date = new Date(data[i].createTime); // Sat Jan 01 2011 01:00:00 GMT+0100 (Central European Standard Time)
    if (!date) {
      return;
    }
    // Get the year and week of the year
    const year = date.getFullYear(); // 2011

    // Calculate the start and end of the week
    const weekend = getWeek(date);
    const startOfWeek = weekend.startOfWeek;
    const endOfWeek = weekend.endOfWeek;

    // Check if the week is already in the weeklyChanges object
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
    } else {
      i += 1;
      continue;
    }

    let differenceOnDaysForward = 0;
    if (endOfWeek.getDate() >= date.getDate()) {
      differenceOnDaysForward = endOfWeek.getDate() - date.getDate();
      console.log(differenceOnDaysForward);
      if (differenceOnDaysForward === 0) {
        differenceOnDaysForward += 7;
      }
    } else {
      const month = date.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      differenceOnDaysForward = daysInMonth - date.getDate() + endOfWeek.getDate();
      console.log("diferent", differenceOnDaysForward);
    }

    // Calculate the percentage difference between the start and end of the week
    if (!data[i + differenceOnDaysForward]) {
      i += differenceOnDaysForward;
      continue;
    }
    const difference =
      ((data[i + differenceOnDaysForward].price - data[i - differenceOnDaysBack].price) /
        data[i - differenceOnDaysBack].price) *
      100;
    weeklyChanges[year][weekCounter].difference += difference;
    console.log("difference", difference);
    console.log("i", i);

    i += differenceOnDaysForward | 7;
    console.log("i", i);

    weekCounter += 1;
  }
  // // Calculate the average difference for each week
  // for (const year in weeklyChanges) {
  //   for (const week in weeklyChanges[year]) {
  //     weeklyChanges[year][week].difference /= data.length;
  //   }
  // }
  return weeklyChanges;
}

function getWeek(timestamp) {
  // Create a new Date object from the Unix timestamp
  const date = new Date(timestamp);
  // Calculate the day of the week (0 = Sunday, 1 = Monday, etc.)
  const dayOfWeek = date.getDay();
  // Calculate the timestamp of the start of the week (Sunday)
  const startOfWeekTimestamp = timestamp - dayOfWeek + 1 * 86400000;
  // Calculate the timestamp of the end of the week (Saturday)
  const endOfWeekTimestamp = startOfWeekTimestamp + 7 * 86400000;
  // Create new Date objects for the start and end of the week
  const startOfWeek = new Date(startOfWeekTimestamp);
  const endOfWeek = new Date(endOfWeekTimestamp);
  // Return an object containing the start and end dates of the week
  return {
    startOfWeek,
    endOfWeek,
  };
}


function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return [d.getUTCFullYear(), Math.ceil(((d - yearStart) / 86400000 + 1) / 7)];
}






















function calculatePercentDifference(data, month, type) {
  const years = {};

  for (let i = 4521; i < data.length; i++) {
    const date = new Date(data[i].createTime);
    const year = date.getFullYear(); //Mon Aug 16 2010 02:00:00 GMT+0200 (Central European Summer Time)
    const monthIndex = date.getMonth() + 1; // 08
    const day = date.getDate(); // 01

    if (!years[year]) {
      years[year] = {};
    }

    if (type === "daily" && monthIndex === month) {
      if (!data[i - 1]) {
        years[year][day] = {};
        continue;
      }
      const prevPrice = data[i - 1].price;
      const currentPrice = data[i].price;

      const calculatePercentageChange = ((currentPrice - prevPrice) / prevPrice) * 100;

      years[year][day] = {};
      years[year][day] = { change: calculatePercentageChange };
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
  }
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
