'use strict';

const upload = require('./upload');
const parseData = require('./parseData');
const {exec} = require('child_process');

module.exports = {};
module.exports.upload = upload;
module.exports.parseData = parseData;

//Global Variables
let frameCount = 0;
let sessionData = [];
const engagementThreshold = 20;
// const emotionThreshold = 50;
const S3imageDelay = 3;
const rekognitionDelay = 4;
const picCountMax = 15;

module.exports.takePicture = (frameCount) => {

  exec(`fswebcam -r 1280x960 images/image${frameCount}.jpg`, (error, stdout, stderr) => {
    if (error) {
      errorHandler(error);
      return;
    }
    errorHandler(stderr);
    return `image${frameCount}.jpg - ${stdout}`;
  });
}

/**
 * function sends photo from S3 to rekognition
 * @param frameCount
 */
module.exports.getFacialRecognitionData = (frameCount) => {
  let awsTerminalCommand = `aws rekognition detect-faces --image '{"S3Object":{"Bucket":"spike-test2","Name":"image${frameCount}.jpg"}}' --attributes "ALL"`;
  exec(awsTerminalCommand, (error, stdout, stderr) => {
    if (error) {
      errorHandler(error);
      return;
    } else if ( stderr ) {
      errorHandler(stderr);
    } else {
      return JSON.parse(stdout).FaceDetails;
    }
  });
}



// function sessionAnalysis ( sessionDataArray ){
//
//   let data = sessionDataArray.reduce( (accumulator, frame) => {
//     accumulator.Engaged += frame.Engaged;
//     accumulator.Unengaged += frame.Unengaged;
//     return accumulator;
//   }, { Engaged:0, Unengaged:0 });
//   console.log( data );
//   return data;
// }

const startRekognition = ( () => {
  let picCount = 0;
  const looper = setInterval(function () {
    if (picCount > picCountMax ) {
      console.log('--------stopping---------');
      // sessionAnalysis(sessionData);
      return sessionData;
      clearInterval(looper);
    }
    frameCount++;

    //Take a picture
    takePicture(frameCount);

    //uploads image to S3
    if (frameCount > S3imageDelay) {
      upload(`./images/image${frameCount - 1}.jpg`);
    }

    console.log(`/ image${frameCount - 1}.jpg /---------------------------------/ Remaining: ${picCountMax - picCount} /`);

    //Send images to rekognition, get data, parse data
    if (frameCount > rekognitionDelay) {
      let data = getFacialRecognitionData(frameCount - 2);
      let frameData = parseData( data, engagementThreshold );
      sessionData.push( frameData );
    }

    picCount++;

  }, 1500);
});

module.exports.startRekognition = startRekognition;

function recognitionHandler(req, res) {
  // anything from the client => req
  // anything you want to return => res
}

function errorHandler(err){
  console.log(err);
}

