// api/helpers/send-for-processing.js
const axios = require('axios');

module.exports = {
  friendlyName: 'Send for processing',

  description: 'Send a row of data to an external API for processing.',

  inputs: {
    row: {
      type: 'ref',
      required: true,
      description: 'The row of data to be sent for processing.'
    }
  },

  exits: {
    success: {
      description: 'All done.',
    },
    error: {
      description: 'An error occurred while sending data for processing.',
    },
  },

  fn: async function (inputs, exits) {
    try {
      // await axios.post('https://example.com/send-for-processing', inputs.row);
      console.log("sned-data")

      return exits.success();
    } catch (error) {
      return exits.error(error);
    }
  }
};
