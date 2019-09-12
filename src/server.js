'use strict';

// 3rd Party Resources
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

// Esoteric Resources
const errorHandler = require('./middleware/error.js');
const notFound = require('./middleware/404.js');
const authRouter = require('./auth/router.js');
const startRekognition = require('./rekognition/rekognition');
const swagger = require(`../docs/config/swagger`);

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

/** This is a route to get data analytics
 * @route GET /data
 * @param {object} req
 * @param {object} res
 * @param {function} next
 * @returns {object} render ejs
 */
server.get('/data', renderDataAnalytics);

/** This is a route to start rekognition
 * @route GET /test
 * @param {object} req
 * @param {object} res
 * @param {function} next
 * @returns {object} JSON
 */
server.get('/test', startRekognition);

/** This is a route for oath re-route
 * @route GET /
 * @param {object} req
 * @param {object} res
 * @param {function} next
 * @returns {object}
 */
server.get('/', renderHomePage);

function renderDataAnalytics (req, res) {
  res.render('../front-end/public/analytics')
}

function renderHomePage (req, res) {
  res.render('../front-end/public/index')
}

server.use('/docs', express.static('./docs'));

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