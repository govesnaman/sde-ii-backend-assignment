const mongoose = require("mongoose");

const uri = "mongodb://127.0.0.1/";

const options = {};

// Connect to MongoDB
mongoose
  .connect(uri, options)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

// If you need to access the Mongoose connection object elsewhere in your code
const db = mongoose.connection;

// Event listeners for Mongoose connection events
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("MongoDB connection opened");
});

// Export the Mongoose connection
module.exports = db;
