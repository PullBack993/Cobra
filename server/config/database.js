const mongoose = require("mongoose");
require("dotenv/config");

// TODO after implement atlas change it
const connectionString = `mongodb://127.0.0.1:27017/zth`;
module.exports = async (app) => {
  try {
    mongoose.set("strictQuery", false);
    await mongoose.connect(connectionString, {
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
