const mongoose = require("mongoose");
require("dotenv/config");

module.exports = async (app) => {
  try {
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
