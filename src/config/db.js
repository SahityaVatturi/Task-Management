const mongoose = require("mongoose");
require("dotenv").config();

/**
 * Connects to the MongoDB database using the URI from environment variables.
 * Logs the connection status or exits the process with an error code if the connection fails.
 *
 * @throws {Error} Throws an error if the connection to MongoDB fails.
 */

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    // Only exit the process in non-test environments
    if (process.env.NODE_ENV !== "test") {
      process.exit(1);
    } else {
      throw new Error("MongoDB connection failed during testing");
    }
  }
};

module.exports = connectDB;
