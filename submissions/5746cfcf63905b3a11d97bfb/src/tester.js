'use strict';
const fs = require('fs');
const zlib = require('zlib');
const app = require('./candidate');
const request = require('request');

let bingo = 0;
let wordsCount = 0;

//------------------------------------------------------------------------------
app.init(zlib.gunzipSync(fs.readFileSync('data.gz')));
testPart(100);

//------------------------------------------------------------------------------
function testPart(idx) {
	if(wordsCount && (wordsCount % 100 == 0))
		console.log(`${wordsCount} words: ${(bingo / wordsCount * 100).toFixed(2)}%`);

	request.get({
	  uri: `https://hola.org/challenges/word_classifier/testcase/${idx}`,
		json: true
	}, (err, message, body) => {
		Object.keys(body).forEach(key => {
			testWord(key, body[key]);
		});
		setImmediate(() => testPart(idx + 1));
	});
}

function testWord(word, isGood) {
	const res = app.test(word);
	wordsCount ++;
	if(res == isGood) {
		bingo ++;
	}
}
