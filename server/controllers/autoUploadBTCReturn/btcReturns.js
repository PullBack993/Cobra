const https = require("https");
const BtcChangeIndicator = require("../../models/BtcChange");

async function fetchNewData() {
  //1. Fetch data
  const options = {
    method: "GET",
    hostname: process.env.BASE_URL,
    port: null,
    path: "/public/v2/index/bitcoin_profitable_days",
    headers: { accept: "application/json", coinglassSecret: process.env.COING_KEY },
  };

  let calculatedDataDay = "";
  let calculatedDataWeek = "";
  let calculatedDataMonth = "";
  let calculatedDataQuarter = "";
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
            console.log(parsedData)
            fetchedData = parsedData.data;
            dataLength = fetchedData?.length;
            //2. Calculate difference between two date
            calculatedDataDay = calculateDailyChanges(fetchedData, dataLength - 1);
            calculatedDataWeek = calculateWeeklyChanges(fetchedData, dataLength - 1);
            calculatedDataMonth = calculateMonthlyChanges(fetchedData, dataLength - 1);
            calculatedDataQuarter = calculateQuarterly(fetchedData, dataLength - 1);
            resolve();
          });
        })
        .on("error", (error) => {
          reject(error);
        });
    });
  };
  try {
    await getData();
  } catch (error) {
    console.error(error);
  }
  //3. Update data base with new data
  updateNewData(calculatedDataDay);
  updateNewDataWeek(calculatedDataWeek, fetchedData);
  updateNewDataMonth(calculatedDataMonth);
  updateNewDataQuarter(calculatedDataQuarter, fetchedData);
}

function updateNewData(calculatedData) {
  const currentDate = new Date();
  const currentYear = currentDate.getUTCFullYear();
  const currentMonth = currentDate.getUTCMonth() + 1;
  const currentDay = currentDate.getUTCDate();

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
        btcChangeDoc.save((error) => {
          if (error) {
            console.error(error);
            return;
          }
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
        btcChangeDoc.save((error) => {
          if (error) {
            console.error(error);
            return;
          }
        });
      }
    }
  );
}

function updateNewDataMonth(calculatedData) {
  const currentDate = new Date();
  const currentYear = currentDate.getUTCFullYear();
  const currentMonth = currentDate.getUTCMonth() + 1;

  // Check if TimeFrame is Day
  BtcChangeIndicator.findOne(
    {
      name: "BTC",
      TimeFrameName: "Month",
    },
    function (err, btcChangeDoc) {
      if (err) throw err;
      if (btcChangeDoc) {
        const currentTimestamp = btcChangeDoc.Timestamp;

        if (!currentTimestamp[currentYear]) {
          currentTimestamp[currentYear] = {};
        }
        if (!currentTimestamp[currentYear][currentMonth]) {
          currentTimestamp[currentYear][currentMonth] = {};
        }
        currentTimestamp[currentYear][currentMonth] = calculatedData;
        btcChangeDoc.Timestamp = currentTimestamp;
        btcChangeDoc.markModified("Timestamp"); // Mixed type => mark a field on a doc. as modified (Mongoose doesn't recognize as modification)
        btcChangeDoc.save((error) => {
          if (error) {
            console.error(error);
            return;
          }
        });
      }
    }
  );
}

function updateNewDataQuarter(calculatedData, fetchedData) {
  const currentDate = new Date();
  const currentYear = currentDate.getUTCFullYear();
  const quarter = calculateCurrentQuarter(fetchedData);

  BtcChangeIndicator.findOne(
    {
      name: "BTC",
      TimeFrameName: "Quarter",
    },
    function (err, btcChangeDoc) {
      if (err) throw err;
      if (btcChangeDoc) {
        const currentTimestamp = btcChangeDoc.Timestamp;
        if (!currentTimestamp[currentYear]) {
          currentTimestamp[currentYear] = {};
        }
        if (!currentTimestamp[currentYear][quarter.q]) {
          currentTimestamp[currentYear][quarter.q] = {};
        }
        currentTimestamp[currentYear][quarter.q] = calculatedData;
        btcChangeDoc.Timestamp = currentTimestamp;
        btcChangeDoc.markModified("Timestamp"); // Mixed type => mark a field on a doc. as modified (Mongoose doesn't recognize as modification)
        btcChangeDoc.save((error) => {
          if (error) {
            console.error(error);
            return;
          }
        });
      }
    }
  );
}

function calculateDailyChanges(data, dataLength) {
  const prevPrice = data[dataLength - 1].price;
  const currentPrice = data[dataLength].price;

  const calculatePercentageChange = calculateDifference(currentPrice, prevPrice);
  return { difference: calculatePercentageChange };
}

function calculateWeeklyChanges(data, dataLength) {
  const untilEndWeek = calculateWeeklyDifference(data);
  const currentPrice = data[dataLength].price;
  const prevPrice = data[dataLength - untilEndWeek].price;

  const calculatePercentageChange = calculateDifference(currentPrice, prevPrice);
  return { difference: calculatePercentageChange };
}

function calculateMonthlyChanges(data, dataLength) {
  const differenceBeginMonth = calculateDifferenceFromBeginMonth(data);
  console.log(differenceBeginMonth);
  const currentPrice = data[dataLength].price;
  const prevPrice = data[dataLength - differenceBeginMonth].price;

  const calculatePercentageChange = calculateDifference(currentPrice, prevPrice);
  return { difference: calculatePercentageChange };
}

function calculateQuarterly(data, dataLength) {
  const quarter = calculateCurrentQuarter(data);
  const startDateQuarter = new Date(new Date().getFullYear(), quarter.begin, 1);

  // Calculate the number of days to the start of the target quarter
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const prevDateQuarter = Math.round(
    (startDateQuarter - data[dataLength].createTime) / millisecondsPerDay
  );
  const currentPrice = data[dataLength].price;
  const prevPrice = data[dataLength - Math.abs(prevDateQuarter)].price;

  const calculatePercentageChange = calculateDifference(currentPrice, prevPrice);
  return { difference: calculatePercentageChange };
}

function calculateCountOfWeeks(data) {
  const inputDate = new Date(data[data.length - 1].createTime);
  const yearStart = new Date(inputDate.getFullYear(), 0, 1);
  const timeDiff = inputDate.getTime() - yearStart.getTime();
  return Math.ceil(timeDiff / (1000 * 60 * 60 * 24 * 7));
}

function calculateWeeklyDifference(data) {
  const currentDate = new Date(data[data.length - 1].createTime);

  // Calculate the day of the week (0-6, where 0 is Sunday)
  const dayOfWeek = currentDate.getDay();

  // Calculate the count of days from Sunday to the current day
  const daysFromSunday = (dayOfWeek + 7) % 7;

  return daysFromSunday;
}

function calculateDifferenceFromBeginMonth(data) {
  const currentDate = new Date(data[data.length - 1].createTime);
  const dayOfMonth = currentDate.getDate();
  const daysFromStartOfMonth = dayOfMonth;
  return daysFromStartOfMonth;
}

function calculateCurrentQuarter(data) {
  const currentDate = new Date(data[data.length - 1].createTime);

  // Get the current month (0-11)
  const currentMonth = currentDate.getMonth();
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
  return {
    years,
  };
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

module.exports = fetchNewData;
