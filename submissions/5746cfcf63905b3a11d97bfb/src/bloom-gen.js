'use strict';

const fs = require('fs');
const mongoose = require('mongoose');
const BloomFilter = require('./bloom-stub').BloomFilter;

mongoose.connect('mongodb://localhost/hola');

const TestWordModel = require('./db-models/TestWord');
const BookWordModel = require('./db-models/BookWord');

let bloom = new BloomFilter(67000 * 8, 1);

const LEN_START = 5,
	LEN_END = 13,
	CHARS_BAD_0 = 'xy',
	CHARS_BAD_1 = '\'jzq',
	CHARS_BAD_2 = '\'qj',
	CHARS_BAD_3 = 'jqx\'',
	CHARS_BAD_4 = 'jqx',
	CHARS_BAD_END = 'qjvzbwxufp';

const prepareWord = word =>
	word.length >= LEN_START
	&& word.length <= LEN_END
	&& CHARS_BAD_END.indexOf(word[word.length - 1]) == -1
	&& CHARS_BAD_0.indexOf(word[0]) == -1
	&& CHARS_BAD_1.indexOf(word[1]) == -1
	&& CHARS_BAD_2.indexOf(word[2]) == -1
	&& CHARS_BAD_3.indexOf(word[3]) == -1
	&& CHARS_BAD_4.indexOf(word[4]) == -1
	? word : null;

const loadBookWords = () => new Promise((resolve, reject) => {
	BookWordModel
	.find()
	.sort({ word: 1 })
	.stream()
	.on('data', doc => {
		if(doc.word.length > 1)
			bloom.add(prepareWord(doc.word));
	})
	.on('error', err => {
		reject(err);
	})
	.on('close', () => {
		resolve();
	});
});

const testWords = () => new Promise((resolve, reject) => {
	let i = 0, bingo = 0;

	TestWordModel
	.find()
	.sort({ page: 1, idx: 1 })
	.stream()
	.on('data', doc => {
		const prepWord = prepareWord(doc.word);
		const res = prepWord ? bloom.test(prepWord) : (doc.word.length == 1 ? true : false);
		if(res == doc.isBook)
			bingo ++;

		i ++;
		if(i % 100000 == 0)
			console.log(`${(bingo / i * 100).toFixed(2)}%`);
	})
	.on('error', err => {
		reject(err);
	})
	.on('close', () => {
		resolve();
	});
});

function toBuffer(arr) {
	var b = new Buffer(arr.length * 4);
	arr.forEach((v,i) => b.writeInt32BE(v,i*4));
	return b;
}

function fromBuffer(buf) {
	var a = Array(buf.length / 4);
	for(let i = 0; i < a.length; i++)
		a[i] = buf.readInt32BE(i*4);
	return a;
}

const loadFile = () => new Promise((resolve, reject) => {
	bloom = new BloomFilter(fromBuffer(fs.readFileSync('data')), 1);
	resolve();
});

//------------------------------------------------------------------------------
const startDate = new Date;

//loadFile()
loadBookWords()
.then(() => console.log(`loadBookWords: ${((new Date - startDate) / 1000).toFixed(2)} sec.`))
.then(() => fs.writeFileSync('data', toBuffer(bloom.bu)))
.then(() => testWords())
.catch(err => {
	console.log(`ERROR: ${err}`);
	process.exit(0);
});
