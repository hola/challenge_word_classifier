'use strict';

let wordClassifier = require('./word_classifier');
let fs = require('fs');
let zlib = require('zlib');

fs.readFile('./compressed_data', (err, data) => {

	let uncompressedData = zlib.gunzipSync(data);
	let dataFile = Buffer.from(uncompressedData.toString());

	wordClassifier.init(dataFile);

	// start testing words
	let stats = { right: 0, wrong: 0 };
	let wrongStats = {};

	fs.readFile('./test_data.txt', (err, words) => {

		let testWords = JSON.parse(words);

		for (let word in testWords) {
			let result = wordClassifier.test(word);
			let realResult = testWords[word];

			if (result == realResult)
				stats.right++;
			else {
				stats.wrong++;
				if (!wrongStats.hasOwnProperty(word.length))
					wrongStats[word.length] = 0;
				wrongStats[word.length]++;
			}
		}

		console.log(`right : ${stats.right}, wrong : ${stats.wrong}`);
		console.log(`correctness : ${Math.round((stats.right / (stats.right + stats.wrong)) * 100)} %`);
		console.log('wrong stats : ' + JSON.stringify(wrongStats));

	});

});