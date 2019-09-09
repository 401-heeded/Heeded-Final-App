'use strict'

const AWS = require('aws-sdk');//Chance- brining in SDK and uuid
AWS.config.update({ region: 'us-west-2' });


const uuid = require('uuid');//Chance
const S3 = new AWS.S3();
const fs = require('fs');

const getFile = (file) => {
    fs.readFile( file, (err, data) => {
      if(err) { throw err; }
      const params = {
        Bucket: "spike-test2",
        Key:file.split('/')[2], //Chance- name of the S3 bucket
        ACL: "public-read-write",
        Body: data,  //Chance- name of the photo in the bucket
      };
      S3.putObject(params, function (err, data) {
        if (err) console.log(err, err.stack);
        else console.log(data);
      })
    })
};

module.exports = getFile;



