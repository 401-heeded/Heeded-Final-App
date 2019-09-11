'use strict';

const upload = require('./s3/upload');
const {exec} = require('child_process');

//Global Variables
let count = 0; // Let's rename this variable something more descriptive, what is this used for idiomatically?
let run = true; // Change this to something that is also more descriptive, such as hasRun or isRun which evokes yes / no semantically.


/**
There are lots of debugging consoles in the following blocks,
  I would love to see an error handling function that can replace a lot of these console.errors
*/
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
  exec(`aws rekognition detect-faces --image '{"S3Object":{"Bucket":"spike-test2","Name":"image${count}.jpg"}}' --attributes "ALL"
`, (error, stdout, stderr) => { // TODO: Change this CLI command into a constant, it looks like its getting hard to manage and seems to have a line break at the end. 
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
      if (count > 3) { // Is this 3 a magic number or something that is configured this way for testing / debugging?  Either way lets go ahead and define it as a constant that lets me know what its used for. ( ie: const imageLimit = 3 )
        upload(`./images/image${count - 1}.jpg`);
      }
      //Send images to rekognition
      if (count > 4) {
        facialRecognition(count - 2);
      }
    }
  }, 3000);
});

