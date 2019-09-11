'use strict';

const express = require('express');
const authRouter = express.Router();

const User = require('./user-model.js');
const auth = require('./middleware.js');
const oauth = require('./oauth/aws-cognito.js');

authRouter.post('/signup', (req, res, next) => {
  let user = new User(req.body);
  user.save()
    .then((user) => {
      req.token = user.generateToken();
      req.user = user;
      res.set('token', req.token);
      res.cookie('auth', req.token);
      res.send(req.token);
    }).catch(next);
});

authRouter.post('/signin', auth, (req, res, next) => {
  res.cookie('auth', req.token);
  res.send(req.token);
});

authRouter.get('/oauth', (req, res, next) => {
  // console.log(req);
  oauth.authorize(req)
    .then(token => {
      res.status(200).render('../../front-end/public/analytics');
    })
    .catch(next);
});

module.exports = authRouter;