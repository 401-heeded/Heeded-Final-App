'use strict';

const upload = require('./upload');

const {exec} = require('child_process');

//Global Variables
//improve variable name
let frameCount = 0;
let run = true;
let sessionData = [];
let engagementThreshold = 20;
const emotionThreshold = 50;
const S3imageDelay = 3;
const rekognitionDelay = 4;

function takePicture(frameCount) {

  exec(`fswebcam -r 1280x960 images/image${frameCount}.jpg`, (error, stdout, stderr) => {
    if (error) {
      errorHandler(error);
      return;
    }
    // console.log(`stdout: ${stdout}`);
    errorHandler(stderr);
  });
}

/**
 * function sends photo from S3 to rekognition
 * @param count
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
        // let emotionArray = output.Emotions;
        // for( let i = 0; i < emotionArray.length; i++ ){
        //   if( emotionArray[i].Confidence > emotionThreshold ){
        //     dataCount.Emotion.push(emotionArray[i].Type);
        //   }
        // }
        return dataCount;
      }, { Engaged: 0, Unengaged: 0, Average: 0, Emotion: [] }).Average;
      console.log(`Engaged: ${frameData.Engaged}, Unengaged: ${frameData.Unengaged}`);
      sessionData.push(frameData);
    }
    errorHandler(stderr);

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
  const looper = setInterval(function () {
    let picCount = 0;
    if (picCount > 15) {
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
      //Send images to rekognition
      if (frameCount > rekognitionDelay) {
        facialRecognition(frameCount - 2);
      }
  }, 3000);

});


function recognitionHandler(req, res) {
  // anything from the client => req
  // anything you want to return => res
}

function errorHandler(err){
  console.log(err);
}

module.exports =  startRekognition;

