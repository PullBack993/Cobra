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
  try{
  BtcChangeIndicator.findOne(
    {
      name: "BTC",
      TimeFrameName: "Day",
    },
    function (err, btcChangeDoc) {
      if (err) throw err;
      if (btcChangeDoc) {
        // The document exists, update its "Timestamp" field
        const currentTimestamp = btcChangeDoc.Timestamp; // TODO year: { 2023 } should be { 2023 }
        if (!currentTimestamp) {
          // If the "years" array does not exist, create it
          currentTimestamp = {};
        }
        if (!currentTimestamp[currentYear]) {
          // If the current year object does not exist, create it
          currentTimestamp[currentYear] = {};
        }
        if (!currentTimestamp[currentYear][currentMonth]) {
          // If the current month object does not exist, create it
          currentTimestamp[currentYear][currentMonth] = {};
        }
        currentTimestamp[currentYear][currentMonth][currentDay] = calculatedData;
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
  }catch( error ){
    console.error(error);
  }
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
  const prevPrice = data[dataLength]?.price;
  const currentPrice = data[dataLength]?.price;

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
  const inputDate = new Date(data[data.length - 1]?.createTime);
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
  const currentDate = new Date(data[data.length - 1]?.createTime);

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


module.exports = fetchNewData;
