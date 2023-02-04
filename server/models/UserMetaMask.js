const { Schema, model } = require("mongoose");

const userMetaMaskSchema = new Schema({
  ethHash: { type: String, required: false },
  ip: { type: String, required: false },
  city: { type: String, required: false },
  imageUrl: { type: String, default: "" },
  isAdmin: { type: Boolean, default: false },
  likedCoin: [{ type: String, default: "" }],
});

const UserMetaMask = model("UserHash", userMetaMaskSchema);

module.exports = UserMetaMask;
