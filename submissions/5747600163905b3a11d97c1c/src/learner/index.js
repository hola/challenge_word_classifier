'use strict';

const request = require('request');
const jsdom = require('jsdom');
const fs = require('fs');

const headers = { 'User-Agent': 'Mozilla/5.0 (Windows NT x.y; Win64; x64; rv:10.0) Gecko/20100101 Firefox/10.0' };

const WORDFIND_URL = 'http://www.wordfind.com/contains/'

const SHORTEST_SEGMENT = 3;
const LONGEST_SEGMENT = 4;
const NEGATIVE_MAX_MATCH_THRESHOLD = 0;
const POSITIVE_MIN_MATCH_THRESHOLD = 50;

let fileStream;

module.exports = function run({ isPositiveMode, failedTests, outDir }) {
	fileStream = fs.createWriteStream(`${outDir}/results-${Date.now()}`);
	
	return writeHeader(isPositiveMode)
		.then(() => getTestCase({ failedTests, isPositiveMode }))
		.then(parseSegments)
		.then(segments => getLikelihood({ segments, isPositiveMode }))
		.then(() => fileStream.end())
		.catch(e => {
			console.error(e);
			console.error('It`s likely this script has been blocked! :(');
			process.exit(1); 
		});
};

function writeHeader(isPositiveMode) {
	const header = `Testing for ${isPositiveMode ? 'positive' : 'negative'} segments...\n\n`;
	console.log(header);
	return writeToFile(header);
}

function getTestCase({ failedTests, isPositiveMode }) {
	return failedTests.filter(f => f.expected === isPositiveMode);
}

function parseSegments(failures) {
	const segments = [];
	
	for (let failure of failures) {
		let { word } = failure;
		
		for (let i = 0; i < word.length - SHORTEST_SEGMENT; i++) {
			for (let j = SHORTEST_SEGMENT + i; j <= LONGEST_SEGMENT + i; j++) {
				let segment = word.substring(i, j);
				
				if (segment && !segment.includes('\'')) {
					segments.push(segment);
				}
			}
		}
	}
	
	return Promise.resolve(segments);
}

function getLikelihood({ segments, isPositiveMode }) {	
	const allRequests = segments.map(segment => `${WORDFIND_URL}${segment}`);
	
	console.log('Scraping WordFind... This WILL take a while!');
	
	return serialiseParsing(allRequests, parseWordFind, isPositiveMode);
}

function serialiseParsing(urls, parser, isPositiveMode) {
	let numReqs = urls.length;
	
	return urls.reduce((promise, url) => {
		return promise.then(() => {
			return makeRequest(url).then(response => parseWordFind({ response, isPositiveMode }))
								   .then(() => console.log(`${--numReqs} remaining...`));
		});
    }, Promise.resolve());
}

function parseWordFind({ response, isPositiveMode }) {
	return convertToDom(response).then(dom => {
		return writeResults({ dom, isPositiveMode });
	});
}

function convertToDom(html) {
	return new Promise((resolve, reject) => {
		jsdom.env(html, (err, window) => {
			if (err) {
				reject(err);
			} else {
				resolve(window.document);
			}
		})
	});
}

function writeResults({ dom, isPositiveMode }) {
	let titleNode = dom.querySelector('.headerAndFB > h1');
	let numNodes = dom.querySelectorAll('.defLink');
	
	if (!titleNode) {
		console.info('Current DOM could not be parsed. Skipping...');
		return Promise.resolve();
	}
	
	let title = titleNode.innerHTML.toLowerCase();
	let numMatches = numNodes.length;
	let result = `${title}: ${numMatches}\n`
	let shouldIgnore = (isPositiveMode && numMatches < POSITIVE_MIN_MATCH_THRESHOLD) || (!isPositiveMode && numMatches > NEGATIVE_MAX_MATCH_THRESHOLD)
	
	if (shouldIgnore) {
		return Promise.resolve();
	}
	
	console.log(result);
	
	// only store the word itself
	return writeToFile(`"${title.replace('words that contain ', '')}",\n`);
}

function writeToFile(data) {
	return new Promise((resolve, reject) => {
		fileStream.write(data, err => {
			if (err) {
				reject(err);
			} else {
				resolve();
			}
		});
	});
}

function makeRequest(url) {
	return new Promise((resolve, reject) => {
		request({ url, options: { headers } }, (error, response, body) => resolve(body));
	});
}