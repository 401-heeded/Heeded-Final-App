'use strict';

const upload = require('./s3/upload');

const { exec } = require('child_process');
let count = 0;
function takePicture (count) {
  exec(`fswebcam -r 1280x720 images/image${count}.jpg`, (error, stdout, stderr) => {
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
`, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
    return;
    }
    console.log('hello------------------------------------------');
    if (stdout.FaceDetails) {
      console.log(`stdout yaw: ${stdout.FaceDetails[0].Pose.Yaw}`);
      console.log(`stdout pitch: ${stdout.FaceDetails[0].Pose.Pitch}`);
      console.log(`stdout eyes open: ${stdout.FaceDetails[0].EyesOpen.Value}`);
    }
    console.error(`stderr: ${stderr}`);
  });
}

setInterval(function(){
  count ++;
  takePicture(count);
  
  if (count > 3) {
    upload(`./images/image${count -1}.jpg`);
  }
  if (count > 4) {
    facialRecognition(count-2);
  }
}, 3000);
