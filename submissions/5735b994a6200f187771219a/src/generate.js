'use strict'

const fs = require('fs');
const solution = require('./solution');

const BLOOM_BIT_COUNT = 64 * 1024 * 8;

function bloomWords(words) {
	let wordset = new Set(words);
	let bloomWords = new Set();
	let bloom = new solution.Bloom(BLOOM_BIT_COUNT);

	for (let i = 0, iLen = words.length; i < iLen; ++i) {
		let word = words[i];

		if (!solution.heuristic(word)) {
			continue;
		}

		word = solution.stem(word);
		bloom.add(word);
		bloomWords.add(word);
	}

	let buf = new Buffer(bloom.buckets.buffer);
	console.log('bloom bytes', buf.length);
	fs.writeFileSync('data.bin', buf);
	console.log('bloom word count', bloomWords.size);
}

if (require.main === module) {
	let words = Array.from(new Set(fs.readFileSync('words.txt', 'utf-8').trim().split('\n').map(x => x.toLowerCase()))).sort();
	bloomWords(words);
	solution.init(fs.readFileSync('data.bin'));
	require('./test').runTests(solution.test);
}
