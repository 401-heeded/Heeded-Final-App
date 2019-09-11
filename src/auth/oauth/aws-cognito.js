'use strict';

require('dotenv').config();
const superagent = require('superagent');
const Users = require('../user-model.js');

const API = 'http://localhost:3000';
const AWS = 'https://has-the-shining.auth.us-west-2.amazoncognito.com/oauth2/token';
const SERVICE = 'https://has-the-shining.auth.us-west-2.amazoncongnito.com/oauth2/userInfo';

const authorize = (request, res, next) => {
  let code = request.query.code;
  console.log('(1)', request.query.code);

  console.log(code, process.env.AWS_KEY, process.env.AWS_SECRET, `${API}/oauth`)
  return superagent.post(AWS)
    .type('form')
    .send({
      code: code,
      client_id: process.env.AWS_KEY,
      client_secret: process.env.AWS_SECRET,
      redirect_uri: `${API}/oauth`,
      grant_type: 'authorization_code',
    })
    .then(token => {
      return superagent.get(SERVICE)
        .set('Authorization', `Bearer ${token}`)
    })
    .then(response => {
      let user = response.body;
      user.access_token = token;
      return user;
    })
    .then(oauthUser => {
      return Users.createFromOauth(oauthUser.email);
    })
    .then(actualUser => {
      return actualUser.generateToken();
    })
    .catch(next);
};


module.exports = { authorize };
