require("dotenv/config");
const { TwitterApi } = require('twitter-api-v2');

const twitterClient = new TwitterApi({
  appKey: process.env.X_CONSUMER_KEY,
  appSecret: process.env.X_CONSUMER_SECRET,
  accessToken: process.env.X_ACCESS_TOKEN,
  accessSecret: process.env.X_ACCESS_TOKEN_SECRET,
  bearerToken: process.env.X_BEARER_TOKEN,
});
const rwClient = twitterClient.readWrite

module.exports =  rwClient;
 