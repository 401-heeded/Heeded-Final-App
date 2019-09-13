'use strict';

const express = require('express');
const authRouter = express.Router();

const oauth = require('./oauth/aws-cognito.js');

authRouter.get('/oauth', (req, res, next) => {
  // console.log(req);
  oauth.authorize(req)
    .then(token => {
      res.status(200).render('pages/analytics');
    })
    .catch(next);
});

module.exports = authRouter;