'use strict';

// 3rd Party Resources
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

// Esoteric Resources
const errorHandler = require('./src/middleware/error.js');
const notFound = require('./src/middleware/404.js');
const authRouter = require('./src/auth/router.js');
const startRekognition = require('./app.js');

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

server.get('/', renderDataAnalytics);
server.get('/test', startRekognition);

function renderDataAnalytics (req, res) {
  res.render('../front-end/public/analytics')
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