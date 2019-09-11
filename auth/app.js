'use strict';

const upload = require('../s3/upload');

const {exec} = require('child_process');

//Global Variables
//improve variable name
let frameCount = 0;
let run = true;
let sessionData = [];
let engagementThreshold = 20;

function takePicture(frameCount) {

  exec(`fswebcam -r 1280x960 images/image${frameCount}.jpg`, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    // console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
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
      console.error(`exec error: ${error}`);
      return;
    }
    let parsed = JSON.parse(stdout);
    if(parsed.FaceDetails) {
      let output = parsed.FaceDetails;
      let frameData = output.reduce( ( engagementCount, person ) => {
        if (Math.abs(person.Pose.Yaw) < engagementThreshold && Math.abs(person.Pose.Pitch) < engagementThreshold ) {
          engagementCount.Engaged++;
        } else {
          engagementCount.Unengaged++;
        }
        return engagementCount;
      }, { Engaged: 0, Unengaged: 0});
      console.log(`Engaged: ${frameData.Engaged}, Unengaged: ${frameData.Unengaged}`);
      sessionData.push(frameData);
    }
    console.error(`stderr: ${stderr}`);

  });
}

function sessionAnalysis ( sessionDataArray ){

  let data = sessionDataArray.reduce( (accumulator, frame) => {
    accumulator.Engaged += frame.Engaged;
    accumulator.Unengaged += frame.Unengaged;
    return accumulator;
  }, { Engaged:0, Unengaged:0 });
  console.log( data );
  return data;
}

const startRekognition = ( (run) => {
  const looper = setInterval(function () {
    //stop code from running
    if (!run) {
      console.log('--------stopping---------');
      sessionAnalysis(sessionData);
      clearInterval(looper);
    }
    if (run) {
      frameCount++;

      //Take a picture
      takePicture(frameCount);

      //uploads image to S3
      if (frameCount > 3) {
        upload(`./images/image${frameCount - 1}.jpg`);
      }
      //Send images to rekognition
      if (frameCount > 4) {
        facialRecognition(frameCount - 2);
      }
    }
  }, 3000);

});


function recognitionHandler(req, res) {
  // anything from the client => req
  // anything you want to return => res
}

module.exports =  startRekognition;

