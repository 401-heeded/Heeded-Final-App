'use strict';

const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

/**
 *
 * user model.
 * @module src/auth/user-model
 */


const users = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String },
  role: { type: String, default: 'user', enum: ['admin', 'editor', 'user'] },
});

/**
 * Creating a model of the user
 * @param email
 * @returns {Promise<never>|Promise<unknown>}
 */
users.statics.createFromOauth = function (email) {

  if (!email) { return Promise.reject('Validation Error'); }

  return this.findOne({ email })
    .then(user => {
      if (!user) { throw new Error('User Not Found'); }
      console.log('Welcome Back', user.username);
      return user;
    })
    .catch(error => {
      console.log('Creating new user');
      let username = email;
      let password = 'none';
      return this.create({ username, password, email });
    });

};

/**
 * Generates token to AWS
 * @returns {undefined|*}
 */
users.methods.generateToken = function () {
  let token = {
    id: this._id,
    role: this.role,
  };
  return jwt.sign(token, process.env.SECRET);
};

module.exports = mongoose.model('users', users);