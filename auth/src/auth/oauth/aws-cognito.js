'use strict';

const superagent = require('superagent');
const Users = require('../user-model.js');
const dotenv = require('dotenv');

const API = 'http://localhost:3000';
const AWS = 'https://has-the-shining.auth.us-east-2.amazoncognito.com/oauth2/token';
const SERVICE = 'https://has-the-shining.auth.us-east-2.amazoncongnito.com/oauth2/userInfo';

const authorize = (request) => {
  let code = req.query.code;
  console.log('(1)', request.query.code);

  return superagent.post(AWS)
    .type('form')
    .send({
      code: code,
      client_id: process.env.AWS_KEY,
      client_secret: process.env.AWS_SECRET,
      redirect_uri: `${API}/oauth`,
      grant_type: 'authorization_code',
    })
    .then(response => {
      let access_token = response.body.access_token;
      console.log('(2)', access_token);
      return access_token;
    })
    .then(token => {
      console.log(SERVICE, token);
      return superagent.get(SERVICE)
        .set('Authorization', `Bearer ${token}`)
        .then(response => {
          let user = response.body;
          user.access_token = token;
          console.log('(3)', user);
          return user;
        });
    })
    .then(oauthUser => {
      console.log('(4) Create Our Account');
      return Users.createFromOauth(oauthUser.email);
    })
    .then(actualUser => {
      return actualUser.generateToken();
    })
    .catch(error => console.log(error));
};


module.exports = { authorize };