// const fs = require("fs");
// const CoinGecko = require("coingecko-api");
const https = require("https");
require("dotenv/config");

const options = {
  method: "GET",
  hostname: "open-api.coinglass.com",
  port: null,
  path: "/public/v2/index/bitcoin_profitable_days",
  headers: { accept: "application/json", coinglassSecret: "233f9d28b54f4a5e8f86c849035aef1a" },
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
    // res.json(generatedData);
  });
});

function calculateWeeklyChanges(data) {
  // Create an object to store the weekly changes
  const weeklyChanges = {};
  let weekCounter = 1;

  // Loop through the data
  for (let i = 4521; i < data.length; ) { // 869 begin 2013 => 4521 1.1.2023
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
    if(startOfWeek.getFullYear() != year){
      i += 1
      continue
    }

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
  console.log(weeklyChanges);
  return weeklyChanges;
}

function getWeek(timestamp) {
  // Create a new Date object from the Unix timestamp
  const date = new Date(timestamp);
  // Calculate the day of the week (0 = Sunday, 1 = Monday, etc.)
  const dayOfWeek = date.getDay();
  // Calculate the timestamp of the start of the week (Sunday)
  const startOfWeekTimestamp = timestamp - (dayOfWeek - 1) * 86400000;
  // Calculate the timestamp of the end of the week (Saturday)
  const endOfWeekTimestamp = startOfWeekTimestamp + 6 * 86400000;
  // Create new Date objects for the start and end of the week
  const startOfWeek = new Date(startOfWeekTimestamp);
  const endOfWeek = new Date(endOfWeekTimestamp);
  // Return an object containing the start and end dates of the week
  return {
    startOfWeek,
    endOfWeek,
  };
}

// Helper function to get the week number of a date
function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return [d.getUTCFullYear(), Math.ceil(((d - yearStart) / 86400000 + 1) / 7)];
}

function calculatePercentDifferenceDaily(data, month, type) {
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
        continue;
      }
      const prevPrice = data[i - 1].price;
      const currentPrice = data[i].price;

      const calculatePercentageChange = ((prevPrice - currentPrice) / prevPrice) * 100;
      years[year][day] = {};
      years[year][day] = { difference: calculatePercentageChange };
    }
  }
  return {
    years,
  };
}

// const CoinGeckoClient = new CoinGecko();
// let max = 10;

// async function test() {
//   for (let i = 1; i <= max; i++) {
//     try {
//       let data = await CoinGeckoClient.coins.all({ page: i });
//       if (!data.data) {
//         await wait(6000);
//       }

//       data.data.forEach((element) => {
//         console.log(element.image);
//         const current = { id: element.id, symbol: element.symbol, image: element.image.small };
//         fs.appendFileSync("coins.json", JSON.stringify(current) + ",", (err) => {
//           console.log(err);
//         });
//       });
//       if (max >= 240) {
//         max += 5;
//         await wait();
//       } else {
//         max += 10;
//         await wait();
//       }
//     } catch (err) {
//       console.log(err);
//       if (max >= 270) {
//         break;
//       }
//       continue;
//     }
//   }
// }
// let SEARCH_VALUES = [
//   "bitcoin",
//   "ethereum",
//   "tether",
//   "euro",
//   "binancecoin",
//   "chainlink",
//   "litecoin",
//   "ripple",
//   "fantom",
//   "avalanche",
// ];

// function takeNeeded(data) {
//   data.forEach((el) => {
//     if (SEARCH_VALUES.includes(el.id)) {
//       console.log(el);
//       fs.appendFileSync("coinsNeeded.json", JSON.stringify(el) + ",", (err) => {});
//     }
//   });
// }

// async function wait(seconds) {
//   console.log("waitttttttttttttttttttttt", new Date().toLocaleTimeString());
//   await new Promise((resolve) => setTimeout(resolve, seconds | 120000));
//   console.log("gooooooooooooooo ", new Date().toLocaleTimeString());
// }

// // test();
// // takeNeeded(fetchCoins);
// const fetchCoins = require("../../coins.json");
// console.log(fetchCoins.length);
