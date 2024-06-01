const { Schema, model } = require("mongoose");

const coinImageSchema = new Schema({
  symbol: {type: String, required: true, unique: true},
  filename: {type: String, required: true, unique: true},
  path: {type: String, required: true},
});

coinImageSchema.index({ symbol: 1 }, { unique: true });

const CoinImages = model('CoinImages', coinImageSchema);

module.exports = CoinImages;


