// api/controllers/CsvProcessorController.js
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const { createObjectCsvWriter } = require('csv-writer');

module.exports = {
  uploadAndProcessCsv: async function (req, res) {
    // Handle file upload
    req.file('csvFile').upload({
      // Set a temporary upload directory
      dirname: path.resolve(sails.config.appPath, 'assets/uploads')
    }, async function (err, uploadedFiles) {
      if (err) {
        return res.serverError(err);
      }
      
      if (uploadedFiles.length === 0) {
        return res.badRequest('No file was uploaded');
      }

      const csvFilePath = uploadedFiles[0].fd;
      
      // Read and process CSV file
      const rows = [];
      const processedRows = [];
      
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (row) => {
          rows.push(row);
        })
        .on('end', async () => {
          try {
            for (const row of rows) {
              const processedRow = await processRow(row);
              processedRows.push(processedRow);
            }
            
            // Write the processed data to a new CSV file
            const processedCsvPath = path.resolve(sails.config.appPath, 'assets/uploads/processed_data.csv');
            await writeProcessedDataToCsv(processedRows, processedCsvPath);
            
            return res.ok({ message: 'CSV processed successfully', processedFilePath: processedCsvPath });
          } catch (error) {
            return res.serverError(error);
          }
        });
    });
  }
};

async function processRow(row) {
  // Send row to external API for processing using helper
  await sails.helpers.sendForProcessing(row);

  // Wait for processing to complete
  let processingComplete = false;
  let processedData = null;
  while (!processingComplete) {
    const response = await sails.helpers.getData.with({ id: JSON.stringify(row) });
    if (response.status === 'complete') {
      processingComplete = true;
      processedData = response.data;
    } else {
      // Wait for some time before polling again
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  return { ...row, ...processedData }; // Merge original row with processed data
}

async function writeProcessedDataToCsv(data, filePath) {
  const csvWriter = createObjectCsvWriter({
    path: filePath,
    header: Object.keys(data[0]).map(key => ({ id: key, title: key }))
  });

  await csvWriter.writeRecords(data);
}
