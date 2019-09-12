'use strict';

const fs = require('fs');
const rekognition = require('../src/rekognition/rekognition');
const takePicture = rekognition.takePicture;
const upload = rekognition.upload;
const getFacialRekognitionData = rekognition.getFacialRecognitionData;
const parseData = rekognition.parseData;
const startRekognition = rekognition.startRekognition;

describe('Test functionality of the Rekognition process', () => {

  test('Takes picture', () => {
    let frameCount = 0;
    let path = `../images/image${frameCount}.jpg`;
    expect(fs.existsSync(path)).toEqual(false);
    takePicture(frameCount);
    expect(fs.existsSync(path)).toEqual(true);
  });

  test('Uploads successfully', () => {

  });

  test('Get data from Rekognition', () => {
    let frameCount = 1;
    takePicture(frameCount);
    expect( Array.isArray(getFacialRekognitionData(frameCount)) ).toEqual(true);
  });

  test('Parse data successfully', () => {
    let frameCount = 2;
    takePicture(frameCount);
    let data = getFacialRekognitionData(frameCount);
    let frameData = parseData( data, 20 );
    expect(typeof frameData.Engaged).toEqual('number');
    expect(typeof frameData.Unengaged).toEqual('number');
    expect(typeof frameData.Average).toEqual('number');
  });

  test('startRekognition loops 15 times and returns session data', () => {
    let sessionData = startRekognition();
    expect(sessionData.length).toBeTruthy();
  });

});
