// api/controllers/CsvProcessorController.js
const csv = require("csv-parser");
const fs = require("fs");
const path = require("path");
const { createObjectCsvWriter } = require("csv-writer");
const { fn } = require("../helpers/utils");
const {
  ProcessingRequestStatus,
} = require("../models/processingRequestStatus");

module.exports = {
  uploadAndProcessCsv: async function (req, res) {
    // Handle file upload
    req.file("csvFile").upload(
      {
        // Set a temporary upload directory
        dirname: path.resolve(sails.config.appPath, "assets/uploads"),
      },
      async function (err, uploadedFiles) {
        if (err) {
          return res.serverError(err);
        }

        if (uploadedFiles.length === 0) {
          return res.badRequest("No file was uploaded");
        }
        const csvFilePath = uploadedFiles[0].fd;

        const fileId = fn(csvFilePath);
        console.log("fileId", fileId);

        await ProcessingRequestStatus.insertOne({
          request_id: fileId,
          file_path: csvFilePath,
          created_at: new Date(),
          status: "pending",
        });

        res.status(200).send({
          message: "CSV queued for proccessing",
          requestId: fileId,
        });
        //save csvFilePath, status = pending to db

        // Read and process CSV file
        const rows = [];
        const processedRows = [];

        fs.createReadStream(csvFilePath)
          .pipe(csv())
          .on("data", (row) => {
            rows.push(row);
          })
          .on("end", async () => {
            try {
              for (const row of rows) {
                const processedRow = await processRow(row);
                await ProcessingRequestStatus.updateOne(
                  {
                    request_id: fileId,
                  },
                  {
                    $set: {
                      status: "completed",
                    },
                  }
                );
                processedRows.push(processedRow);
              }

              // Write the processed data to a new CSV file
              const processedCsvPath = path.resolve(
                sails.config.appPath,
                "assets/uploads/processed_data.csv"
              );
              await writeProcessedDataToCsv(processedRows, processedCsvPath);

              return res.ok({
                message: "CSV processed successfully",
                processedFilePath: processedCsvPath,
              });
            } catch (error) {
              await ProcessingRequestStatus.updateOne(
                {
                  request_id: fileId,
                },
                {
                  $set: {
                    status: "failed",
                  },
                }
              );
              return res.serverError(error);
            }
          });
      }
    );
  },
  getCsvStatus: async function (req, res) {
    const requestId = req.params.request_id;

    if (!requestId) {
      return res.badRequest("Please provide requestId of the file uploaded");
    }

    const result = await ProcessingRequestStatus.findOne({
      request_id: requestId,
    });

    if (!result) {
      return res.badRequest("Incorrect requestId");
    }
    console.log(result);
    return res.ok({
      message: `File status for request id ${requestId} is ${result.status}`,
    });
  },
};

async function processRow(row) {
  // Send row to external API for processing using helper
  await sails.helpers.sendForProcessing(row);

  // Wait for processing to complete
  let processingComplete = false;
  let processedData = null;
  while (!processingComplete) {
    const response = await sails.helpers.getData.with({
      id: JSON.stringify(row),
    });
    if (response.status === "complete") {
      processingComplete = true;
      processedData = response.data;
    } else {
      // Wait for some time before polling again
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }

  return { ...row, ...processedData }; // Merge original row with processed data
}

async function writeProcessedDataToCsv(data, filePath) {
  const csvWriter = createObjectCsvWriter({
    path: filePath,
    header: Object.keys(data[0]).map((key) => ({ id: key, title: key })),
  });

  await csvWriter.writeRecords(data);
}
