const fs = require('fs');
const os = require('os');

const userDef = process.argv[2];
const user = !userDef ? os.userInfo().username: userDef;
const computer = process.argv[3];

// Path for keys
const computerFile = !computer ? './client.json': `./keys/${computer}.json`
const serverFile = './server.json';
const userPathFile = './userpath.json';

// Get user path
function getUserPath(callback) {
    readDataFromFile(userPathFile, (err, data) => {
        if (err) {
            callback(err);
        } else {
            callback(null, data.path);
        }
    });
}

// Function to read data from JSON file
function readDataFromFile(filename, callback) {
    console.log(filename)
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
function readClient(callback, asUser=false, username=null) {
    if (asUser) {
        getUserPath((err, userFile) => {
            if (err) console.log(err)
            if (username) u = username
            else u = user
            return readDataFromFile(userFile.replace("USER", u), callback);
        });
    } else {
        return readDataFromFile(computerFile, callback);
    }
}

// Write client
function writeClient(data, callback, asUser=false, username=null) {
    if (asUser) {
        getUserPath((err, userFile) => {
            if (err) console.log(err)
            if (username) u = username
            else u = user
            writeDataToFile(userFile.replace("USER", u), data, callback);
        });
    } else {
        writeDataToFile(computerFile, data, callback);
    }
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