const https = require("https");
const BtcChangeIndicator = require("../../models/BtcChange");
const weeklyCount = Array(53).fill("");
const monthlyCount = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const quarterlyCount = ["Q1", "Q2", "Q3", "Q4"];

const options = {
  method: "GET",
  hostname: process.env.BASE_URL,
  port: null,
  path: "/public/v2/index/bitcoin_profitable_days",
  headers: { accept: "application/json", coinglassSecret: process.env.COING_KEY },
};

// to fill db with data
//  bitcoinReturns()

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
          resolve(parsedData.data);
        });
      })
      .on("error", (error) => {
        reject(error);
      });
  });
}

// Usage example:
async function bitcoinReturns() {
  console.log('test')
  try {
    const data = await fetchNewDataPeriod();
    const period = 503; // begin of 2010
    const dailyData = dailyPercentDifferencePeriod(data, period);
    const weeklyData = weeklyPercentDifferencePeriod(data, period);
    const monthData = monthlyPercentDifferencePeriod(data, period);
    const quarterData = quarterlyPercentDifferencePeriod(data, period);
    saveData(dailyData, "Day");
    saveData(weeklyData, "Week", weeklyCount);
    saveData(monthData, "Month", monthlyCount);
    saveData(quarterData, "Quarter", quarterlyCount);
  } catch (error) {
    console.error(error);
  }
}

async function saveData(data, type, length) {
  if (data) {
    const generatedData = new BtcChangeIndicator({
      name: "BTC",
      TimeFrameName: type,
      Timestamp: data,
      Length: length,
    });
    generatedData.save();
  }
}

function dailyPercentDifferencePeriod(data, period) {
  const dailyChanges = {};

  for (let i = period; i < data.length; i++) {
    const date = new Date(data[i].createTime);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    if (!dailyChanges[year]) {
      dailyChanges[year] = {};
    }

    if (!data[i - 1]) {
      dailyChanges[year][day] = {};
      continue;
    }
    if (!dailyChanges[year][month]) {
      dailyChanges[year][month] = {};
    }
    const endPrice = data[i - 1].price;
    const startPrice = data[i].price;

    const percentageDifference = calculateDifference(startPrice, endPrice);

    if (!dailyChanges[year][month]) {
      dailyChanges[year][month] = {};
    }
    dailyChanges[year][month][day] = { difference: percentageDifference };
  }
  return dailyChanges;
}

function weeklyPercentDifferencePeriod(data, period) {
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
    const startPrice = data[i + differenceOnDaysForward].price;
    const endPrice = data[i - differenceOnDaysBack].price;
    const percentageDifference = calculateDifference(startPrice, endPrice);

    weeklyChanges[year][weekCounter] = { difference: percentageDifference };

    i += differenceOnDaysForward | 7;

    weekCounter += 1;
  }

  return weeklyChanges;
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

    const startPrice = data[i + differenceToNextMonth].price;
    const endPrice = data[i - differenceToBegin - 1].price;
    const percentageDifference = calculateDifference(startPrice, endPrice);

    monthlyChanges[year][month] = { difference: percentageDifference };

    i += differenceToNextMonth + 1;
  }

  return monthlyChanges;
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

    const endPrice = data[i].price;
    const startPrice = data[i + differenceInDays].price;

    const percentageDifference = calculateDifference(startPrice, endPrice);
    quarterly[year][quarter] = { difference: percentageDifference };

    i += differenceInDays + 1;
  }

  return quarterly;
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

module.exports = fetchNewDataPeriod , bitcoinReturns;
