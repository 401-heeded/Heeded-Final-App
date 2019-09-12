'use strict';

/**
 *
 * 404 error.
 * @module src/middleware/404.js
 */

/**
 * Sends error not found
 * @param req
 * @param res
 * @param next
 */
module.exports = (req, res, next) => {
  let error = { error: 'Resource Not Found' };
  res.statusCode = 404;
  res.statusMessage = 'Not Found';
  res.setHeader('Content-Type', 'application/json');
  res.write(JSON.stringify(error));
  res.end();
};