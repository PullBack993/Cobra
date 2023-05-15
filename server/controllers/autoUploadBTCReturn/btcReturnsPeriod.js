const https = require("https");
const BtcChangeIndicator = require("../../models/BtcChange");

const options = {
  method: "GET",
  hostname: process.env.BASE_URL,
  port: null,
  path: "/public/v2/index/bitcoin_profitable_days",
  headers: { accept: "application/json", coinglassSecret: process.env.COING_KEY },
};

function fetchNewDataPeriod() {
  return new Promise((resolve, reject) => {
    https
      .get(options, (response) => {
        let data = "";
        response.on("data", (chunk) => {
          data += chunk;
        });
        response.on("end", () => {
          const parsedData = JSON.parse(data);
          resolve(parsedData);
        });
      })
      .on("error", (error) => {
        reject(error);
      });
  });
}

// Usage example:
(async () => {
  try {
    const data = await fetchNewDataPeriod();
    const period = 503; // begin of 2010
    dailyPercentDifferencePeriod(data, period);
  } catch (error) {
    console.error(error);
  }
})();

function calculateDifference(currentPrice, prevPrice) {
  return ((currentPrice - prevPrice) / prevPrice) * 100;
}

function dailyPercentDifferencePeriod(data, period) {
  const years = {};

  for (let i = period; i < data.length; i++) {
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
  years;
}
async function saveData(data, type) {
  if (data) {
    const generatedData = new BtcChangeIndicator({
      name: "BTC",
      TimeFrameName: type,
      Timestamp: data,
    });
    generatedData.save();
  }
}
function weeklyPercentDifferencePeriod(data, period) {
  // 869 begin 2013 => 4521 1.1.2023
  const weeklyChanges = {};
  let weekCounter = 1;

  for (let i = period; i < data.length; ) {
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

function quarterlyPercentDifferencePeriod(data, period) {
  const quarterly = {};

  for (let i = period; i < data.length; ) {
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
    }

    if (!quarterly[year]) {
      quarterly[year] = {};
      quarterly[year][quarter] = { difference: 0 };
    }

    const startPrice = data[i].price;
    const endPrice = data[i + differenceInDays].price;

    const percentageDifference = calculateDifference(startPrice, endPrice);
    quarterly[year][quarter] = { difference: percentageDifference };
    i += differenceInDays + 1;
  }
  return quarterly;
}

function monthlyPercentDifferencePeriod(data, period) {
  const monthlyChanges = {};

  for (let i = period; i < data.length; ) {
    const date = new Date(data[i].createTime);
    if (!data) return;

    const day = date.getDate();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const daysInMonth = new Date(year, month, 0).getDate();

    if (!monthlyChanges[year]) {
      monthlyChanges[year] = {};
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
    difference =
      ((data[i + differenceToNextMonth].price - data[i - differenceToBegin - 1].price) /
        data[i - differenceToBegin - 1].price) *
      100;
    monthlyChanges[year][month] = { difference: difference };

    i += differenceToNextMonth + 1;
  }
  return monthlyChanges;
}

function calculateDifference(currentPrice, prevPrice) {
  return ((currentPrice - prevPrice) / prevPrice) * 100;
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

module.exports = fetchNewDataPeriod;
// {/* <ul
//   role="listbox"
//   aria-activedescendant=":rk5:-option-4"
//   id=":rk5:"
//   tabindex="0"
//   class="MuiSelect-listbox Joy-expanded MuiPopper-root cg-style-1872y3"
//   style=""
// >
//   <li
//     aria-selected="false"
//     id=":rk5:-option-0"
//     role="option"
//     data-first-child=""
//     class="MuiOption-root cg-style-1gtdedo"
//   >
//     5 minute
//   </li>
//   <li
//     aria-selected="false"
//     id=":rk5:-option-1"
//     role="option"
//     class="MuiOption-root cg-style-k8pch7"
//   >
//     15 minute
//   </li>
//   <li
//     aria-selected="false"
//     id=":rk5:-option-2"
//     role="option"
//     class="MuiOption-root cg-style-k8pch7"
//   >
//     30 minute
//   </li>
//   <li
//     aria-selected="false"
//     id=":rk5:-option-3"
//     role="option"
//     class="MuiOption-root cg-style-k8pch7"
//   >
//     1 hour
//   </li>
//   <li
//     aria-selected="true"
//     id=":rk5:-option-4"
//     role="option"
//     class="MuiOption-root MuiOption-highlighted Joy-selected cg-style-17a6iif"
//   >
//     4 hour
//   </li>
//   <li
//     aria-selected="false"
//     id=":rk5:-option-5"
//     role="option"
//     class="MuiOption-root cg-style-k8pch7"
//   >
//     12 hour
//   </li>
//   <li
//     aria-selected="false"
//     id=":rk5:-option-6"
//     role="option"
//     class="MuiOption-root cg-style-k8pch7"
//   >
//     24 hour
//   </li>
// </ul>; */}
