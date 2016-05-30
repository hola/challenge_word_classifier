'use strict';

const fs = require('fs');
const request = require('request');
const chalk = require('chalk');
const Table = require('easy-table');
const isItEnglish = require('./');
const isItEnglishLearner = require('../is-it-english-learner');

const PASS_COLOUR = 'green';
const WARNING_COLOUR = 'orange';
const FAIL_COLOUR = 'red';
const PASS_MESSAGE = 'Passed';
const FAIL_MESSAGE = 'Failed';
const MIN_PASS_RATE = 60;
const DESIRED_PASS_RATE = 70;

const dataBuffer = fs.readFileSync('data.json');

isItEnglish.init(dataBuffer);

getTestCase().then(runTests);

function getTestCase() {
	return new Promise(resolve => {
		const seed = Math.round(Math.random() * Number.MAX_SAFE_INTEGER);
		const url = `https://hola.org/challenges/word_classifier/testcase/${seed}\n`;
		
		const options = {
			url,
			headers: { 'User-Agent': 'Is It English? Test Harness' }
		};
		
		console.log(`Test data: ${url}`);
		
		request(options, (error, response, body) => resolve(JSON.parse(body)));
	});
}

function runTests(testCases) {
	let testCount = Object.keys(testCases).length;	
	let table = new Table();
	let failedTests = [];
	
	let testsPassed = 0;
	
	for (let word in testCases) {
		let hasPassed = assert(word, testCases[word]);
		
		if (hasPassed) {
			testsPassed++;
		} else {
			failedTests.push({
				word,
				expected: testCases[word],
				actual: !testCases[word]
			});
		}
		
		appendTableRow({ table, word, hasPassed });
	}
	
	printResults({ table, testsPassed, testCount });
	
	//return isItEnglishLearner({ isPositiveMode: Math.round(Math.random()) === 1, failedTests, outDir: '../is-it-english-learner' });
}

function assert(word, isEnglish) {
	const expectedResult = isEnglish;
	const actualResult = isItEnglish.test(word);
	
	return expectedResult === actualResult;
}

function appendTableRow({ table, word, hasPassed }) {
	const colour = hasPassed ? PASS_COLOUR : FAIL_COLOUR;
	const message = hasPassed ? PASS_MESSAGE : FAIL_MESSAGE;
	
	table.cell('Word', word);
	table.cell('Result', chalk[colour](message));
	table.newRow();
}

function printResults({ table, testsPassed, testCount }) {
	const passRate = Math.round(testsPassed / testCount * 100);

	console.log(table.toString());
	console.log(`Pass rate: ${passRate}%`);
}