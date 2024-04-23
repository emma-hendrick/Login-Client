const fs = require('fs');

// Path for keys
const clientFile = './client.json';
const serverFile = './server.json';

// Function to read data from JSON file
function readDataFromFile(filename, callback) {
    fs.readFile(filename, 'utf8', (err, data) => {
        if (err) {
            callback(err);
        } else {
            try {
                const jsonData = JSON.parse(data);
                callback(null, jsonData);
            } catch (parseError) {
                callback(parseError);
            }
        }
    });
}

// Function to write data to JSON file
function writeDataToFile(filename, jsonData, callback) {
    const jsonString = JSON.stringify(jsonData);
    fs.writeFile(filename, jsonString, 'utf8', callback);
}

// Read client
function readClient(callback) {
    readDataFromFile(clientFile, callback);
}

// Write client
function writeClient(data, callback) {
    writeDataToFile(clientFile, data, callback);
}

// Get server url
function getServer(callback) {
    readDataFromFile(serverFile, (err, data) => {
        if (err) {
            callback(err);
        } else {
            callback(null, data.url);
        }
    });
}

module.exports = { readClient, writeClient, getServer }