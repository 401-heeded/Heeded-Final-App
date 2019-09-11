'use strict';
const rekognition = require('../rekognition');

$('#start').on('click', function() {
  console.log('hi you started');
  startRekognition();
  // $.ajax('/rekognition')
});
