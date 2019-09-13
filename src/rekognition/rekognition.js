'use strict';

const upload = require('./upload');

const {exec} = require('child_process');

//Global Variables
//improve variable name
let frameCount = 0;
let sessionData = [];
let engagement ={};
let engagementThreshold = 20;
const S3imageDelay = 3;
const rekognitionDelay = 4;
const loopMax = 60;

function takePicture(frameCount) {

  exec(`fswebcam -r 1280x960 images/image${frameCount}.jpg`, (error, stdout, stderr) => {
    if (error) {
      errorHandler(error);
      return;
    }
    errorHandler(stderr);
  });
}

/**
 * function sends photo from S3 to rekognition
 * @param frameCount
 */
function facialRecognition (frameCount) {
  let awsTerminalCommand = `aws rekognition detect-faces --image '{"S3Object":{"Bucket":"spike-test2","Name":"image${frameCount}.jpg"}}' --attributes "ALL"`;
  exec(awsTerminalCommand, (error, stdout, stderr) => {
    if (error) {
      errorHandler(error);
      return;
    }
    let parsed = JSON.parse(stdout);
    if(parsed.FaceDetails) {
      let output = parsed.FaceDetails;
      let frameData = output.reduce( ( dataCount, person ) => {
        if (Math.abs(person.Pose.Yaw) < engagementThreshold && Math.abs(person.Pose.Pitch) < engagementThreshold ) {
          dataCount.Engaged++;
        } else {
          dataCount.Unengaged++;
        }
        dataCount.Average = dataCount.Engaged / ( dataCount.Engaged + dataCount.Unengaged );
        engagement.attention = dataCount.Average;
        return dataCount;
      }, { Engaged: 0, Unengaged: 0, Average: 0 });
      console.log(`/ image${frameCount}.jpg / ------------------/ Average Engagement: ${frameData.Average} /`);
      sessionData.push(frameData);
    }
    errorHandler(stderr);

  });
}


const startRekognition = ( () => {
  let loopCount = 0;
  const looper = setInterval(function () {
    
    if (loopCount > loopMax) {
      let output = sessionAnalysis(sessionData);
      console.log('--------stopping---------');
      console.log(`Total Engaged: ${output.Engaged}`);
      console.log(`Total Unengaged: ${output.Unengaged}`);
      console.log(`Average Session Engagement Level: ${output.Average}`);
      clearInterval(looper);
      return sessionData;
    }
    
    frameCount++;

    //Take a picture
    takePicture(frameCount);

    //uploads image to S3
    if (frameCount > S3imageDelay) {
      upload(`./images/image${frameCount - 1}.jpg`);
    }
    
    //Send images to rekognition
    if (frameCount > rekognitionDelay) {
      facialRecognition(frameCount - 2);
    }
    
    loopCount++;
    
  }, 1500);

});

function errorHandler(err){
  console.log(err);
}

module.exports =  {startRekognition, engagement};





function sessionAnalysis ( sessionDataArray ){
  
  let data = sessionDataArray.reduce( (accumulator, frame) => {
    accumulator.Engaged += frame.Engaged;
    accumulator.Unengaged += frame.Unengaged;
    accumulator.Average = accumulator.Engaged / ( accumulator.Engaged + accumulator.Unengaged );
    return accumulator;
  }, { Engaged:0, Unengaged:0, Average:0 });
  return data;
}


