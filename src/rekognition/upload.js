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
          Bucket: "spike-test2",
          Key: file.split('/')[2],
          ACL: "pages-read-write",
          Body: data,
        };
        S3.putObject(params, function (err, data) {
          if (err) console.log(err, err.stack);
          else console.log(data);
        })
      }
    });
};

module.exports = getFile;



