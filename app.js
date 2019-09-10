'use strict';

const upload = require('./s3/upload');

const {exec} = require('child_process');

//Global Variables
let count = 0;
let run = true;

function takePicture(count) {

  exec(`fswebcam -r 1280x720 images/image${count}.jpg`, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
  });
}

/**
 * function sends photo from S3 to rekognition
 * @param count
 */
function facialRecognition(count) {
  exec(`aws rekognition detect-faces --image '{"S3Object":{"Bucket":"spike-test2","Name":"image${count}.jpg"}}' --attributes "ALL"
`, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    let output = JSON.parse(stdout);

    if (output.FaceDetails) {
      console.log('hello------------------------------------------');
      console.log(`stdout yaw: ${output.FaceDetails[0].Pose.Yaw}`);
      console.log(`stdout pitch: ${output.FaceDetails[0].Pose.Pitch}`);
      console.log(`stdout eyes open: ${output.FaceDetails[0].EyesOpen.Value}`);
    }
    console.error(`stderr: ${stderr}`);
  });
}

const startRekognition = ((run) => {
  const looper = setInterval(function () {
    //stop code from running
    if (!run) {
      console.log('--------stopping---------');
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
  }, 500);
});
