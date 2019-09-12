'use strict';

const fs = require('fs');
const startRekognition = require('../src/rekognition/rekognition.js');

describe('Rekognition functionality', () => {
	
	test('Takes 15 pictures', () => {
		
		startRekognition;
		
		let path = null;
		
		for( let i = 0; i < 17; i++ ){
			
			path = (`../images/image${i}.jpg`);
			
			expect(fs.existsSync(path)).toEqual(true);
		}
	});
	
//	test('', () => {
		
//	});

});
