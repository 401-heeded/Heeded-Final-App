'use strict';

const upload = require('./s3/upload');

const {exec} = require('child_process');

//Global Variables
let count = 0;
let run = true;
let sessionData = [];

function takePicture(count) {

  exec(`fswebcam -r 1280x960 images/image${count}.jpg`, (error, stdout, stderr) => {

    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    // console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
  });
}

function facialRecognition (count) {
  let string = `aws rekognition detect-faces --image '{"S3Object":{"Bucket":"spike-test2","Name":"image${count}.jpg"}}' --attributes "ALL"`;
  exec(string, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }

    let parsed = JSON.parse(stdout);

    if (parsed.FaceDetails) {
      let output = parsed.FaceDetails;
      let frameData = { Engaged: 0, Unengaged: 0 };
      output.forEach( person => {
        analyzeFrame( person.Pose.Yaw, person.Pose.Pitch, frameData );
        console.log(`image${count}.jpg------------------------------------------`);
        console.log(`yaw: ${person.Pose.Yaw}`);
        console.log(`pitch: ${person.Pose.Pitch}`);
      });
      console.log(`Engaged: ${frameData.Engaged}, Unengaged: ${frameData.Unengaged}`);
      sessionData.push( frameData );
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

function analyzeFrame( yaw, pitch, frameData ){
  if ( Math.abs(yaw) < 20 && Math.abs(pitch) < 20 ) frameData.Engaged++;
  else frameData.Unengaged++;
}

const startRekognition = ((run) => {
  const looper = setInterval(function () {
    //stop code from running
    if (!run) {
      console.log('--------stopping---------');
      sessionAnalysis(sessionData);
      clearInterval(looper);
    }
    if (run) {
      count++;

      //Take a picture
      takePicture(count);

      //uploads image to S3
      if (count > 3) {
        upload(`./images/image${count - 1}.jpg`);
      }
      //Send images to rekognition
      if (count > 4) {
        facialRecognition(count - 2);
      }
    }
  }, 3000);
});

startRekognition();

