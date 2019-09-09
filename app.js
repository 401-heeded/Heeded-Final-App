'use strict';

const { exec } = require('child_process');
let count = 0;
function takePicture (count) {
  exec(`fswebcam -r 1280x720 image${count}.jpg`, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
    return;
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
  });
}

setInterval(function(){
  count ++;
  if (count > 1) {
    takePicture(count-1);
  }
}, 2000);