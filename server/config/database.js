const mongoose = require("mongoose");
require("dotenv/config");

module.exports = async (app) => {
  try {
    mongoose.set("strictQuery", false);
    // const mongoDB = process.env.MONGODB_URI || dev_db_url; // TODO change to it before live.
    await mongoose.connect(process.env.DB_CONNECTION_STR, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: process.env.DB_NAME,
    });
    console.log("Database connection");

    mongoose.connection.on("error", (err) => {
      console.error(`Database error ==> ${err.message}`);
      console.error(err);
    });
  } catch (err) {
    console.error(`Message: ${err.message} ==> Error connection to database`);
    process.exit(1);
  }
};
