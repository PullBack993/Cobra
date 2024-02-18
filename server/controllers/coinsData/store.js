const Coin = require("../../models/LongShort");
const CronJob = require("cron").CronJob;

async function updateData(coinData, data) {
  const coinName = coinData.exchangeName;
  const coinLogo = coinData.exchangeLogo;

  try {
    let coin = await Coin.findOne({ coinName });
    let coinExist = await Coin.exists({ coinName });

    if (!coin && !coinExist) {
      coin = new Coin({ coinName, coinLogo });
    }

    for (const exchangeData of data) {
      const { exchangeName, exchangeLogo, longRate, shortRate, timestamp } = exchangeData;

      let exchange = coin.exchanges.find((ex) => ex.exchangeName === exchangeName);

      if (!exchange) {
        exchange = { exchangeName, exchangeLogo, data: [{ longRate, shortRate, timestamp }] };
        coin.exchanges.push(exchange);
      } else {
        exchange.data.push({ longRate, shortRate, timestamp });
      }
    }
    return await coin.save();
  } catch (error) {
    console.error("Error updating data:", error);
  }
}

async function calculateLongShortAverage(coinName, time) {
  // time milliseconds
  try {
    const result = await Coin.aggregate([
      { $match: { coinName } },
      { $unwind: "$exchanges" },
      {
        $project: {
          coinName: 1,
          coinName: "$coinName",
          coinLogo: "$coinLogo",
          exchangeName: "$exchanges.exchangeName",
          exchangeLogo: "$exchanges.exchangeLogo",
          baseOnTimeData: {
            $filter: {
              input: "$exchanges.data",
              as: "rate",
              cond: {
                $lte: [{ $subtract: [Date.now(), "$$rate.timestamp"] }, { $multiply: [time, 1] }],
              },
            },
          },
        },
      },
      { $unwind: "$baseOnTimeData" },
      {
        $group: {
          _id: {
            exchangeName: "$exchangeName",
            exchangeLogo: "$exchangeLogo",
          },
          longRateAvg: { $avg: "$baseOnTimeData.longRate" },
          shortRateAvg: { $avg: "$baseOnTimeData.shortRate" },
        },
      },
      { $sort: { "_id.exchangeName": 1 } },
      {
        $group: {
          _id: 0,
          list: {
            $push: {
              exchangeName: "$_id.exchangeName",
              exchangeLogo: "$_id.exchangeLogo",
              longRate: "$longRateAvg",
              shortRate: "$shortRateAvg",
            },
          },
        },
      },
    ]);
    if (result.length > 0) {
      return moveElementToFirstPosition(result[0].list, coinName);
    } else {
      return [{ message: "No data for the specified period" }];
    }
  } catch (error) {
    console.error("Error calculating calculateLongShortAverage average:", error);
  }
}

async function getLastLongShortData(coinName) {
  const result = await Coin.aggregate([
    { $match: { coinName: coinName } }, // Replace 'yourCoinName' with the actual coin name
    { $unwind: "$exchanges" },
    {
      $project: {
        _id: 0,
        coinName: "$coinName",
        coinLogo: "$coinLogo",
        exchangeName: "$exchanges.exchangeName",
        exchangeLogo: "$exchanges.exchangeLogo",
        lastData: {
          $arrayElemAt: [
            {
              $filter: {
                input: "$exchanges.data",
                as: "rate",
                cond: {
                  $gte: [
                    { $subtract: [Date.now(), "$$rate.timestamp"] },
                    { $multiply: [0, 1] }, // 0 means now
                  ],
                },
              },
            },
            -1,
          ],
        },
      },
    },
    { $unwind: "$lastData" },
    {
      $group: {
        _id: {
          exchangeName: "$exchangeName",
          exchangeLogo: "$exchangeLogo",
          long: "$lastData.longRate",
          short: "$lastData.shortRate",
        },
      },
    },
    { $sort: { "_id.exchangeName": 1 } },
    {
      $group: {
        _id: 0,
        list: {
          $push: {
            exchangeName: "$_id.exchangeName",
            exchangeLogo: "$_id.exchangeLogo",
            longRate: "$_id.long",
            shortRate: "$_id.short",
          },
        },
      },
    },
  ]);
  return moveElementToFirstPosition(result[0].list, coinName);
}

const moveElementToFirstPosition = (array, name) => {
  const index = array.findIndex((item) => item.exchangeName === name);

  // If the element is found, move it to the first position
  if (index !== -1) {
    const elementToMove = array.splice(index, 1)[0];
    array.unshift(elementToMove);
  }

  return array;
};

async function removeOutdatedRates() {
  const currentTime = Date.now();
  const cutoffTime = currentTime - 24 * 60 * 60 * 1000; // 24 hours

  await Coin.updateMany(
    { "exchanges.data.timestamp": { $lt: cutoffTime } },
    {
      $pull: {
        "exchanges.$.data": { timestamp: { $lt: cutoffTime } },
      },
    }
  );
}

const removeUnusedData = new CronJob("0 0 * * *", () => {
  const timeNow = new Date();
  console.log(
    "Remove unused data =>>> ",
    timeNow.getHours() + ":" + timeNow.getMinutes() + ":" + timeNow.getSeconds()
  );
  removeOutdatedRates();
});

removeUnusedData.start();

module.exports = {
  calculateLongShortAverage,
  updateData,
  getLastLongShortData,
};
