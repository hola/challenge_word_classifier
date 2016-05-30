'use strict';

const request = require('request');
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/hola');

const BookWordModel = require('./BookWord.js');

request.get({ uri: `https://cdn.rawgit.com/hola/challenge_word_classifier/1945d565fd929118c88fbceadfe4818d138e3b5f/words.txt` }, (err, message, body) => {

	BookWordModel.remove({}, err => {
		if(err) {
			console.log(`ERROR:\n${err}`);
			process.exit(0);
		}

		const words = Array.from(new Set(body.toLowerCase().split('\n').filter(word => word.length >= 1))).map(word => ({ word }));

		BookWordModel.collection
		.insert(words, (err, docs) => {
			if(err) {
				console.log(`ERROR:\n${err}`);
				process.exit(0);
			}
			else {
				console.log(`OK: ${words.length}`);
				process.exit(1);
			}
		});

	});

});
