const crypto = require('crypto');
const axios = require('axios');
const { readClient, writeClient, getServer } = require('../json_dat');

// Add a response interceptor to handle errors globally
axios.interceptors.response.use(
    response => {
      return response;
    },
    error => {
      // If there's an error, return the error response
      if (error.response) {
        return {
            status: error.response.status,
            data: error.response.data
        };
      } else {
        // If it's a network error or similar, create a custom error response
        return {
          status: 500,
          data: { error: 'Network Error' }
        };
      }
    }
  );

// Get a credential
const getCredential = async (req, res, next) => {
    // Get credential from the server
    getServer(async (err, url) => {
        // If there is an error send it through the error handling middleware
        if (err) {
            next(err);
            return;
        }

        // Get our keys to decrypt the servers response
        const response = await axios.get(`${url}/credential/${req.username}/${req.credentialName}`);
        if (response.status != 200) {
            res.status(response.status).send(response.data);
            return;
        }

        // Get encrypted user and pass
        const {username, password} = response.data;

        readClient((err, client) => {
            // If there is an error send it through the error handling middleware
            if (err) {
                next(err);
                return;
            }

            privatekey = client.privatekey;

            console.log(username)

            const user_decrypted = crypto.privateDecrypt({ key: privatekey, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING }, Buffer.from(username.data));
            const pass_decrypted = crypto.privateDecrypt({ key: privatekey, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING }, Buffer.from(password.data));
            data = {
                username: user_decrypted.toString('utf8'),
                password: pass_decrypted.toString('utf8')
            }

            // Return the credentials
            res.status(200).json(data);
        });
    });

}

// Set a credential
const setupCredential = async (req, res, next) => {
    data = req.body; // JSON data from the post request

    username = data.username;
    if (!username) {
        res.status(400).send('Username must be provided.');
        return;
    }

    password = data.password;
    if (!password) {
        res.status(400).send('Password be provided.');
        return;
    }

    // Write credential to the server
    getServer(async (err, url) => {
        // If there is an error send it through the error handling middleware
        if (err) {
            next(err);
            return;
        }

        // Get the servers public key
        const responseKey = await axios.get(`${url}/server`);
        if (responseKey.status != 200) {
            res.status(responseKey.status).json(responseKey.data);
            return;
        }

        const publickey = responseKey.data;

        const user_encrypted = crypto.publicEncrypt({ key: publickey, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING }, Buffer.from(username, 'utf8'));
        const pass_encrypted = crypto.publicEncrypt({ key: publickey, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING }, Buffer.from(password, 'utf8'));

        data = {
            username: user_encrypted,
            password: pass_encrypted
        }

        // Add the credential to the server 
        const response = await axios.post(`${url}/credential/${req.username}/${req.credentialName}`, data);
        res.status(response.status).json(response.data);
    });
}

// Delete a credential
const deleteCredential = async (req, res, next) => {
    // Send delete to the server
    getServer(async (err, url) => {
        // If there is an error send it through the error handling middleware
        if (err) {
            next(err);
            return;
        }

        // Add the user to the server 
        const response = await axios.delete(`${url}/credential/${req.username}/${req.credentialName}`);
        res.status(response.status).json(response.data);
    });
}

// Set up the client for first time user
const setupClient = async (req, res, next) => {
    // Generate client keys
    const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 4096, // Key size
        publicKeyEncoding: {
            type: 'pkcs1', // Public key type
            format: 'pem' // Key format
        },
        privateKeyEncoding: {
            type: 'pkcs1',
            format: 'pem'
        }
    });

    // Client keys
    client = {
        privatekey: privateKey,
        publickey: publicKey
    }

    // Write client keys to the file
    writeClient(client, (err) => {
        // If there is an error send it through the error handling middleware
        if (err) {
            console.log(err);
            return;
        }
    });

    // Write client to the server
    getServer(async (err, url) => {
        // If there is an error send it through the error handling middleware
        if (err) {
            next(err);
            return;
        }

        // Set the data for the server
        data = {
            keys: {
                public: publicKey
            },
            auth: "0"
        }

        // Add the user to the server 
        const response = await axios.post(`${url}/user/${req.username}`, data);
        res.status(response.status).json(response.data);
    });
}

module.exports = { getCredential, setupCredential, deleteCredential, setupClient };