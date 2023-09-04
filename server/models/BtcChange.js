const { Schema, model } = require("mongoose");

const btcChange = new Schema({
  name: { type: String, required: true },
  TimeFrameName: { type: String, required: true },
  Timestamp: { type: Object, default: {} },
  Length: {type: Array, default: []},
});

const BtcChangeIndicator = model("BtcChangeIndicator", btcChange);

module.exports = BtcChangeIndicator;
