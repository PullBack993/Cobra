const mongoose = require("mongoose");
const { Schema } = mongoose;

const coinSchema = new Schema(
  {
    rank: Number,
    name: String,
    symbol: String,
    logoUrl: String,
    price: String,
    volume: String,
    change: String,
    timeFrame: String, // '1h', '24h', '7d', etc.
    category: String, // 'all', 'top100', 'top300', 'top1000'
    status: String,
  },
  { timestamps: true }
);

const GainerLosersCoin = mongoose.model("GainerLosersCoin", coinSchema);

module.exports = GainerLosersCoin;
