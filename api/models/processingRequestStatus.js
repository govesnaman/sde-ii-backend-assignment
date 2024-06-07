const mongoose = require("mongoose");
const db = require("./init");

const ProcessingRequestStatusSchema = new mongoose.Schema({
  request_id: String,
  file_path: String,
  created_at: Date,
  status: {
    type: String,
    enum: ["pending", "completed", "failed"],
  },
});

const processingRequestStatus = db.model(
  "ProcessingRequestStatus",
  ProcessingRequestStatusSchema
);

exports.ProcessingRequestStatus = new processingRequestStatus().collection;
