'use strict';

const express = require('express');
const authRouter = express.Router();

const oauth = require('./oauth/aws-cognito.js');

/** This is a route for oath
 * @route GET /oath
 * @param {object} req
 * @param {object} res
 * @param {function} next
 * @returns {object} render ejs
 */
authRouter.get('/oauth', (req, res, next) => {
  // console.log(req);
  oauth.authorize(req)
    .then(token => {
      res.status(200).render('../../front-end/public/analytics');
    })
    .catch(next);
});

module.exports = authRouter;