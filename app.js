'use strict';

const { exec } = require('child_process');
let count = 0;
function takePicture (count) {
  exec(`fswebcam -r 1280x960 image${count}.jpg`, (error, stdout, stderr) => {
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
  takePicture(count);
}, 2000);