const axios = require('axios');
const fs = require('fs');
const Cron = require("cron").CronJob;


const API_URL = 'https://api.coingecko.com/api/v3/coins/list';
const JSON_FILE_PATH = './coins.json';


function fetchAndSaveCoins() {
  axios.get(API_URL)
    .then((response) => {
      const newCoins = response.data;

      // Check if the JSON file exists
      if (fs.existsSync(JSON_FILE_PATH)) {
        // Read the existing JSON data
        const existingData = JSON.parse(fs.readFileSync(JSON_FILE_PATH, 'utf-8'));

        // Merge the new data with the existing data (e.g., add or update coins)
        const updatedData = [...existingData, ...newCoins];

        // Save the updated data back to the file
        fs.writeFileSync(JSON_FILE_PATH, JSON.stringify(updatedData, null, 2));
      } else {
        // If the file doesn't exist, just save the new data
        fs.writeFileSync(JSON_FILE_PATH, JSON.stringify(newCoins, null, 2));
      }

    })
    .catch((error) => {
      console.error('Error fetching coins:', error);
    });
}

// Schedule the job to run every day at a specific time (adjust as needed)
const cronJob = new Cron('0 0 * * *', () => {
    fetchAndSaveCoins();
  }, null, true, 'UTC'); // Set your desired timezone here

  cronJob.start();

// Initial fetch and save when the script is run
fetchAndSaveCoins();
