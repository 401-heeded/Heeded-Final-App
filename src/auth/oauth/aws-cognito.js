'use strict';
const superagent = require('superagent');
const Users = require('../user-model.js');
const dotenv = require('dotenv');
const API = 'http://localhost:3000';
const AWS = 'https://has-the-shining.auth.us-west-2.amazoncognito.com/oauth2/token';
const SERVICE = 'https://has-the-shining.auth.us-west-2.amazoncognito.com/oauth2/userInfo';

const authorize = (request) => {
  let code = request.query.code;
  return superagent.post(AWS)
    .type('form')
    .send({
      code: code,
      client_id: process.env.CLIENT_ID,
      //client_secret: process.env.AWS_SECRET,
      redirect_uri: `${API}/oauth`,
      grant_type: 'authorization_code',
    })
    .then(response => {
      let access_token = response.body.access_token;
      return access_token;
    })
    .then(token => {
      return superagent.get(SERVICE)
        .set('Authorization', `Bearer ${token}`)
        .then(response => {
          let user = response.body;
          user.access_token = token;
          return user;
        });
    })
    .then(oauthUser => {
      return Users.createFromOauth(oauthUser.email);
    })
    .then(actualUser => {
      return actualUser.generateToken();
    })
    .catch(error => console.log(error));
};
module.exports = { authorize };
