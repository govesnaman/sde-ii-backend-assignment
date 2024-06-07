// config/routes.js
module.exports.routes = {
  "POST /upload-csv": "CsvProcessorController.uploadAndProcessCsv",
  "GET /csv-status/:request_id": "CsvProcessorController.getCsvStatus",
};
