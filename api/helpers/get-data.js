// api/helpers/get-data.js
const axios = require('axios');

module.exports = {
  friendlyName: 'Get data',

  description: 'Fetch data from an external API.',

  inputs: {
    id: {
      type: 'string',
      required: true,
      description: 'The ID of the data to be fetched.'
    }
  },

  exits: {
    success: {
      description: 'Data retrieved successfully.',
    },
    error: {
      description: 'An error occurred while fetching data.',
    },
  },

  fn: async function (inputs, exits) {
    try {
      // const response = await axios.get('https://example.com/get-data', {
      //   params: { id: inputs.id }
      // });
      console.log("get-data")
      if (getRandomZeroOrOne()) {
        return exits.success({ status: 'complete' });
      }
      else {
        return exits.success({ status: 'in-complete' });

      }
    } catch (error) {
      return exits.error(error);
    }
  }
};

function getRandomZeroOrOne() {
  return Math.round(Math.random());
}
