// We will use express to build the server, and use crypto to encrypt and decrypt the resources
const express = require('express');
const bodyParser = require('body-parser');

// Default app and port
const app = express();
const port = 3001;

// Middleware to parse JSON bodies
app.use(bodyParser.json())

// When someone makes a request
app.use('/', require('./routes'));

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!')
})

// Listen on the port
app.listen(port, () => {
    console.log(`Listening on port: ${port}`)
})