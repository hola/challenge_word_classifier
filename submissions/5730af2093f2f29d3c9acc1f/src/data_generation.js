// FACTS :
// - There are ~660k words
// - Most of the words are between 4 and 19 characters long

// RULE 1 : if the word has an apostraphe but doesn't end with 's - then it's not a valid word
// EXPLANATION : there are only 401 words in the whole dictionary that have an apostrophe, but don't end with 's
//				 There are ~146k words that end with 's in the dictionary


// RESEARCH :
// - find the stats of all the 3 letter permutations
// - normalize the stats scores
// - go over different words, and make a score for each words according to their stats
// - try to define what an average word score is

'use strict';

const fs = require('fs');
const zlib = require('zlib');


// BUILD ALL 3 LETTER PERMUTATIONS
console.log(' ==> Starting to build all permutations');
let alphabet = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
let permutations = [];
for (let i=0; i<alphabet.length; i++) {
	for (let j=0; j<alphabet.length; j++) {
	 	for (let l=0; l<alphabet.length; l++) {
			let p = alphabet[i] + alphabet[j] + alphabet[l];
			if (permutations.indexOf(p) >= 0)
				continue;
			permutations.push(p);
	 	}
	}
}
console.log(`found ${permutations.length} permutations`);
console.log(' -> DONE');


// SETTING UP STRUCTURE TO SAVE PERMUTATION STATS
console.log(' ==> Building data structure to save permutation stats');
let permutationStats = {};
for (let i=0; i<permutations.length; i++) {
	permutationStats[permutations[i]] = 0;
}
console.log('hash map initialized');
console.log(' -> DONE');


// COUNT HOW MANY TIMES EACH PERMUTATION APPEARS IN DICTIONARY
console.log(' ==> Starting permutation stats calculation');
let wordsHistory = [];
let fileData = fs.readFileSync('./words.txt');
let words = fileData.toString().split('\n');

for (let i=0; i<words.length; i++) {

	let word = words[i].toLowerCase();
	if (wordsHistory.indexOf(word) != -1)
		continue;

	let a = word.length;
	let b = word.toLowerCase();

	if (word.indexOf('\'s') != -1)
		word = word.replace('\'s', '');
	if (word.indexOf('\'') != -1)
		continue;

	for (let j=0; j<word.length - 2; j++) {
		let wordPart = word.substr(j, 3);
		permutationStats[wordPart]++;
	}

	if (i % 100000 == 0) console.log(i);
}
console.log(' -> DONE');

console.log(' ==> Writing permutation stats to file');
fs.writeFileSync('permutation_stats.txt', JSON.stringify(permutationStats));
console.log(' -> DONE');



// START NORMALIZING THE STATS
console.log(' ==> Normalizing stats');
var normalize = function(val) {
	if (val == 0) return 0;
	let normalized = Math.ceil((val / 36228) * 100);  // i know that 36228 is the highest value in our permutation_stats object/file
	return normalized == 0 ? 1 : normalized;
}

fileData = fs.readFileSync('./permutation_stats.txt');
let stats = JSON.parse(fileData);

let total = 0;
let maxCount = 0;
let wordCounter = 0;
permutations = 0;

for (let stat in stats) {

	total += stats[stat];

	wordCounter += stats[stat];
	permutations++;

	if (stats[stat] > maxCount)
		maxCount = stats[stat];
}

console.log('permutations : ' + permutations);
console.log('words : ' + wordCounter);
console.log('max count : ' + maxCount);
console.log('total : ' + total);

// normalize the data
let normalizedStats = {};
for (let stat in stats) {
	normalizedStats[stat] = normalize(stats[stat]);
}

let c = 0;
for (let stat in normalizedStats) {
	if (normalizedStats[stat] > 0)
		c++;
}
console.log('over 0 : ' + c);

fs.writeFileSync('normalized_stats.txt', JSON.stringify(normalizedStats));
console.log(' -> DONE');


console.log(' ==> Compressing final data file');
let finalNormalizedData = fs.readFileSync('./normalized_stats.txt');
let compressedData = zlib.gzipSync(finalNormalizedData);
fs.writeFileSync('./compressed_data', compressedData);
console.log(' -> DONE');


console.log(' ==> Preparing word stats');
let wordSum = 1;
let wordStats = {};
for (let j=0; j<words.length; j++) {
	let dictionaryWord = words[j].toLowerCase();
	let wordLength = dictionaryWord.length;
	if (!wordStats.hasOwnProperty(wordLength))
		wordStats[wordLength] = { avg:0, count:0 };

	if (dictionaryWord.indexOf('\'') != -1)
		continue;

	wordSum = 1;
	for (let i=0; i<wordLength - 2; i++) {
		wordSum *= normalizedStats[dictionaryWord.substr(i, 3)];
	}

	if (wordStats[wordLength].count == 0) {
		wordStats[wordLength].avg = wordSum;
		wordStats[wordLength].count = 1;
	}
	else {
		wordStats[wordLength].avg = Math.round(((wordStats[wordLength].avg * wordStats[wordLength].count) + wordSum) / (wordStats[wordLength].count + 1));
		wordStats[wordLength].count++;
	}
}
for (let stat in wordStats) {
	wordStats[stat] = wordStats[stat].avg;
}
console.log(wordStats);
console.log(' -> DONE');
