'use strict'

const glob = require('glob');

function runTests(test, init, data) {
	if (init) {
		init(data);
	}

	console.log();
	console.log('Testing...');

	let total = 0;
	let successes = 0;

	glob.sync('testcases/*.json').forEach((filename, i) => {
		if (Math.random() < 0.5) {
			return;
		}

		let testCase = require('./' + filename);

		Object.keys(testCase).forEach(testWord => {
			let expected = testCase[testWord];
			let result = test(testWord);
			total++;
			successes += result === expected;
		})
	});

	if (total) {
		console.log('score', Math.round(successes / total * 100000) / 100000, successes + '/' + total);
	}

	return successes;
}

exports.runTests = runTests;
