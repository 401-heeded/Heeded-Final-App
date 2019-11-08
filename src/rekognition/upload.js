'use strict'

const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-west-2' });

const S3 = new AWS.S3();
const fs = require('fs');

const getFile = (file) => {
    fs.readFile(file, (err, data) => {
      if (file) {
        if (err) {
          throw err;
        }
        const params = {
          Bucket: "heeded-bucket",
          Key: "test",
          ACL: "public-read-write",
          Body: data,
        };

        console.log(params)
        S3.putObject(params, function (err, data) {
          if (err) console.log(err, err.stack);
          else console.log(data);
        })
      }
    });
};


module.exports = getFile;



