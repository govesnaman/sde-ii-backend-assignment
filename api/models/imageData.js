const mongoose = require("mongoose");
const db = require("./init");

const ImageDataSchema = new mongoose.Schema({
  request_id: String,
  file_path: String,
  created_at: Date,
});

const ImageDataModel = db.model("ImageData", ImageDataSchema);

module.exports = new ImageDataModel();
