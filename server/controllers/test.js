// const fs = require("fs");
// const CoinGecko = require("coingecko-api");
const https = require("https");
require("dotenv/config");
// const BtcChangeIndicator = require("../models/BtcChange");

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
    // const generatedData = calculateQuarterly(parseData.data, 1, "daily");
    console.log(parseData);
    // res.json(generatedData);
  });
});

function calculateQuarterly(data) {
  const quarterly = {};
  let isFullQuarter = false;
  for (let i = 503; i < data.length; ) {
    // Step 1: Convert timestamp into a Date object
    let date = new Date(data[i].createTime);
    const year = date.getFullYear();
    const firstDayOfMonth = new Date(year, date.getMonth(), 1);
    let differenceBackDay = 0;
    if (firstDayOfMonth.getDate() !== date.getDate()) {
      console.log(firstDayOfMonth);
      console.log(date);
      console.log(firstDayOfMonth.getDate());
      console.log(date.getDate());
      differenceBackDay = date.getDate() - firstDayOfMonth.getDate();
      i -= differenceBackDay;
    }
    const quarter = Math.floor(date.getMonth() / 3) + 1;

    // Step 3: Get the starting and ending dates of the quarter
    const startDate = new Date(year, (quarter - 1) * 3, 1);
    const endDate = new Date(year, quarter * 3, 0);

    // Step 4: Retrieve the prices for the starting and ending dates of the quarter
    // You will need to replace the below sample prices with your actual data
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
    quarterly[year][quarter] = percentageDifference;
    if (isFullQuarter) {
      i += differenceInDays + 2;
    }
    i += differenceInDays + 1;

    // Step 5: Calculate the percentage change in prices
  }
  console.log(quarterly);
  return quarterly;
}

function calculateMonthlyChanges(data) {
  const monthlyChanges = {};

  for (let i = 4521; i < data.length; ) {
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
    // if month not full is then should calculate until day today
    const difference =
      calculateDifference()(
        (data[i + differenceToNextMonth].price - data[i - differenceToBegin].price) /
          data[i - differenceToBegin].price
      ) * 100;
    monthlyChanges[year][month] = difference;

    i += differenceToNextMonth + 1;
    console.log(monthlyChanges);
  }
}

function calculateDifference(startPrice, endPrice) {
  return ((endPrice - startPrice) / startPrice) * 100;
}

function calculateWeeklyChanges(data) {
  // Create an object to store the weekly changes
  const weeklyChanges = {};
  let weekCounter = 1;

  // Loop through the data
  for (let i = 4521; i < data.length; ) {
    // 869 begin 2013 => 4521 1.1.2023
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

    // Calculate the percentage difference between the start and end of the week
    if (!data[i + differenceOnDaysForward]) {
      differenceOnDaysForward = data.length - i - 1; // 3days
    }
    const difference =
      ((data[i + differenceOnDaysForward].price - data[i - differenceOnDaysBack].price) /
        data[i - differenceOnDaysBack].price) *
      100;
    weeklyChanges[year][weekCounter].difference += difference;

    i += differenceOnDaysForward | 7;

    weekCounter += 1;
  }

  console.log(weeklyChanges);
  return weeklyChanges;
}

function getWeek(timestamp) {
  // Create a new Date object from the Unix timestamp
  const date = new Date(timestamp);
  // Calculate the day of the week (0 = Sunday, 1 = Monday, etc.)
  const dayOfWeek = date.getDay();
  // Calculate the timestamp of the start of the week (Sunday)
  const startOfWeekTimestamp = timestamp - dayOfWeek * 86400000;
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

      const calculatePercentageChange = ((currentPrice - prevPrice) / prevPrice) * 100;
      if (!years[year][month]) {
        years[year][month] = {};
      }
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

{
  /* <ul
  role="listbox"
  id=":R1l9mdqlq6:-listbox"
  aria-labelledby=":R1l9mdqlq6:-label"
  class="MuiAutocomplete-listbox MuiPopper-root cg-style-pw5ii0"
  data-first-child=""
  style="position: absolute; inset: 0px auto auto 0px; width: 98px; margin: 0px; transform: translate(700px, 999px);"
  data-popper-placement="bottom"
>
  <li
    role="presentation"
    class="MuiListItem-root MuiListItem-nesting MuiListItem-colorNeutral MuiListItem-variantPlain MuiAutocomplete-noOptions cg-style-d6c682"
  >
    No options
  </li>
</ul>; */
}
{
  /* <li class="MuiAutocomplete-option cg-style-zixclz" tabindex="-1" role="option" id=":R1l9mdqlq6:-option-0" data-option-index="0" aria-disabled="false" aria-selected="false">ETH</li> */
}

