const { Schema, model } = require("mongoose");

const rateSchema = new Schema(
  {
    longRate: { type: Number, required: true },
    shortRate: { type: Number, required: true },
    timestamp: { type: Number, required: true },
  },
  { _id: false },
);

const exchangeSchema = new Schema({
  exchangeName: { type: String, required: true },
  exchangeLogo: { type: String, required: true },
  data: [rateSchema],
});

const coinSchema = new Schema({
  coinName: { type: String, },
  coinLogo: { type: String, },
  exchanges: [exchangeSchema],
});

const Coin = model("Coin", coinSchema);

module.exports = Coin;
