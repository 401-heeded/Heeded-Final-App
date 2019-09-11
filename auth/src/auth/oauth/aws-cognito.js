'use strict';

const superagent = require('superagent');
const Users = require('../user-model.js');
const dotenv = require('dotenv');

const API = 'http://localhost:3000';
const AWS = 'https://has-the-shining.auth.us-west-2.amazoncognito.com/oauth2/token';
const SERVICE = 'https://has-the-shining.auth.us-west-2.amazoncongnito.com/oauth2/userInfo';

const authorize = (request) => {
  let code = request.query.code;
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
    .then(token => {
       // remove console logging of sensitive info
      return superagent.get(SERVICE)
        .set('Authorization', `Bearer ${token}`)
    })
    .then(response => { // I know we showed off this code in the demo but this then statement can be added to the overall chain of then statement and ideally should not be nested.

      let user = response.body;
      user.access_token = token;
       // this is considered sensitive, remove after debugging and commitint to production.
      return user;
    })
    .then(oauthUser => {
       // remove this as well after debugging complete.
      return Users.createFromOauth(oauthUser.email);
    })
    .then(actualUser => {
      return actualUser.generateToken();
    })
    .catch(error => console.log(error));
};


module.exports = { authorize };
