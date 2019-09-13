'use strict';

// 3rd Party Resources
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

// Esoteric Resources
const errorHandler = require('./middleware/error.js');
const notFound = require('./middleware/404.js');
const authRouter = require('./auth/router.js');
const Rekognition = require('./rekognition/rekognition');

// Prepare the express server
const server = express();

// Set the view engine for server-side templating
server.set('view engine', 'ejs');

// App Level MW
server.use(cors());
server.use(morgan('dev'));

server.use(express.json());
server.use(express.urlencoded({ extended: true }));

// Routes
server.use(authRouter);

server.get('/data', renderDataAnalytics);
server.get('/init', Rekognition.startRekognition);
server.get('/getValue', sendData);
server.get('/', renderHomePage);

function renderDataAnalytics (req, res) {
  res.render('../front-end/public/analytics', {engagement : Rekognition.engagement});
}

function sendData (req, res) {
  res.send({engagement : Rekognition.engagement});
}

function renderHomePage (req, res) {
  res.render('../front-end/public/index')
}
// Catchalls
server.use(notFound);
server.use(errorHandler);

module.exports = {
  server: server,
  start: (port) => {
    server.listen(port, () => {
      console.log(`Server Up on ${port}`);
    });
  },
};
