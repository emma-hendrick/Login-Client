const routes = require('express').Router();
const { getCredential, setupCredential, deleteCredential, setupClient } = require('../controllers/client');

// Middleware to get a username from route parameters
const extractUser = (req, res, next) => {
    const username = req.params.username;
    if (!username) {
        return res.status(400).send('Username is required')
    }

    req.username = username;
    next();
}

// Middleware to get a credential name from route parameters
const extractCredential = (req, res, next) => {
    const credentialName = req.params.credentialname;
    if (!credentialName) {
        return res.status(400).send('Credential name is required')
    }

    req.credentialName = credentialName;
    next();
}

// Route requests for users
routes.route('/user/:username')
    .all(extractUser)
    .get(setupClient);

// Route requests for credentials
routes.route('/credential/:username/:credentialname')
    .all(extractUser)
    .all(extractCredential)
    .get(getCredential)
    .post(setupCredential)
    .delete(deleteCredential);

module.exports = routes;