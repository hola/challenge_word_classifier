'use strict';

const request = require('request');
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/hola');

const TestWordModel = require('./TestWord.js');

const paraCount = 30;

//--

const loadPage = (page) => new Promise((resolve, reject) => {
	request.get({
		uri: `https://hola.org/challenges/word_classifier/testcase/${page}`,
		json: true
	}, (err, message, body) => {
		TestWordModel.collection.insert(Object.keys(body).map((word, idx) => ({ word, page, idx, isBook: body[word] }) ), (err, docs) => {
			if(err && err.code == 11000)
				console.log(`Page ${page} REloaded.`);
			if(err && err.code != 11000)
				reject(err);
			else
				resolve();
		});
	});
});

const mainLoop = (page) => {
	Promise.all((new Array(paraCount)).fill().map((val, i) => loadPage(page + i)))
	.then(() => {
		console.log(`Pages ${page}...${page + paraCount - 1} loaded.`);
		setImmediate(() => mainLoop(page + paraCount));
	}, err => {
		console.log(`Pages ${page}...${page + paraCount - 1} NOT loaded:\n${err}`);
		process.exit(1);
	});
}

//-----------------------------
TestWordModel.findOne().sort('-page').exec(function(err, doc) {
	const startPage = doc ? doc.page - paraCount > 0 ? doc.page - paraCount : 1 : 1;
	TestWordModel.find({ page: { $gte: startPage }}).remove(err => {
		mainLoop(startPage);
	});
});
