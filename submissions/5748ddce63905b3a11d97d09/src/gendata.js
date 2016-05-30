'use strict';
let readline = require('readline'),
	fs = require('fs'),
	path = require('path');
	//csv = require('csv');
	
let minChars = 0,
	maxChars = 999,
	dict = [];

for (let i = "a".charCodeAt(0); i < "z".charCodeAt(0); i++) {
	dict.push(String.fromCharCode(i));
}
dict.push("'");
let dictLen = dict.length;

function readTxt(path) {
	var p = new Promise((resolve, reject) => {
		let input = fs.createReadStream(path),
			lineReader = readline.createInterface({
			  input: input
			}),
			words = [],
			i = 0;

		lineReader.on('line', function (line) {
			words[i++] = line;
		});
		lineReader.on('close', () => {
			resolve(words);
		});
	})
	return p;
}

function lenFilter(word) {
	let len = word.length;
	return len > minChars &&  len < maxChars;
}

// !!! Can be ins,del,swap !!! this is a basic calculation!
function calcDistance(w1, w2) {
	let len1 = w1.length,
		len2 = w2.length;

	let len = Math.min(len1, len2),
	result = Math.abs(len1 - len2);
	for (let i = 0; i < len; i++) {
		if (w1[i] !== w2[len]) {
			result++;
		}
	}
	return result;
}

/**
 * Randomize array element order in-place.
 * Using Durstenfeld shuffle algorithm.
 */
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

function charToCode(ch) {
	if (ch === "'") {
		return 27;
	} else {
		return ch.toLowerCase().charCodeAt(0) - 96;
	}
}

function codeToChar(code) {
	if (code === 27) {
		return "'";
	} else {
		return String.fromCharCode(96+code);
	}
}

function getWordCase(w) {
	if (w.toLowerCase() === w) {
		return 0;
	} else if (w.toUpperCase() === w) {
		return 2;
	} else {
		return 1;
	}
}

function word2case(w, wCase) {
	switch (wCase) {
		case 0:
			return w.toLowerCase();
			break;
		case 1:
			return w.substr(0,1).toUpperCase() + w.substr(1).toLowerCase();
			break;
		case 2:
			return w.toUpperCase();
			break;
		default:
			return null;
			break;
	}
}

let ERR_REPLACE = 1;
let ERR_INS = 2;
let ERR_DEL = 3;
let ERR_SWAP = 4;

function makeBadWord(w, i, type, len) {
    //console.log('makeBadWord', arguments);
	switch (type) {
		case ERR_REPLACE:
			let newChrs = [];
			for (let pos = i; pos < len + i; pos++) {
				let chr = w[pos];
				let code = charToCode(chr);
				// console.log('!!!', Math.floor(Math.random() * (dictLen - 1)) % dictLen);
                // sometimes 32 and 126 " ~"
				newChrs.push(codeToChar(
                    (code + Math.floor(Math.random() * (dictLen - 1))) % dictLen
				));
			}
			//console.log(w.substr(0, i), newChrs, w.substr(i + len));
			return w.substr(0, i) + newChrs.join('') + w.substr(i + len);
			break;

		case ERR_INS:
			return w.substr(0, i) + codeToChar(Math.floor(Math.random() * dictLen)) + w.substr(i);
			break;

		case ERR_DEL:
			return w.substr(0, i) + w.substr(i + len);
			break;

		case ERR_SWAP:
			let group = w.substr(i, len).split('').reverse().join('');
			return w.substr(0, i) + group + w.substr(i + len);
			break;			
	}
}

function makeBadWords(word, goodIdx, badIdx, wordDict) {
    //console.log('makeBadWords', arguments);
	let result = [];
	// 1 + 2 chars errors
	let wLen = word.length;
	let wordsLen = wordDict.length;

	function addWord(badWord, err) {
		if (!badIdx[badWord] && !goodIdx[badWord]) {
			result.push([badWord, err]);
			badIdx[badWord] = 1;
			return true;
		} else {
			return false;
		}
	}

	function genRetry(word, type, len, targetCount, retriesLeft, err) {
		let genCount = 0;
        //console.error("genRetry");
		while (genCount < targetCount && retriesLeft > 0) {
			let pos = Math.floor(Math.random() * (word.length - len));
            let badWord = makeBadWord(word, pos, type, len); // fails
		
			if (addWord(badWord, err)) {
				genCount++;
			} else {
                retriesLeft--;
            }
            //console.log('loop', arguments);
		}
		return genCount;
	}

	//while (i--) {
		//word = "" + word;
		let genCount = 0;
		if (wLen > 1) {
			//console.log("1ch REPL", word);
			// 1char replace
			genCount += genRetry(word, 1, 1, 1+Math.floor(wLen / 3), 30, 1); // FAILS HERE
//console.log(genCount);
			//console.log("1ch INS");
			// 1char ins
			genCount += genRetry(word, 2, 1, 1+Math.floor(wLen / 8), 10, 2);
		}
		
		if (wLen > 2) {
			//console.log("1ch DEL");
			// 1char del
			genCount += genRetry(word, 3, 1, 1+Math.floor(wLen / 4), 10, 3); // fails here! freeze
		}
		
		if (wLen > 3) {
			// 2 char swap
			//console.log("1ch SWAP");
			genCount += genRetry(word, 4, 2, 1+Math.floor(wLen / 4), 10, 4);
		}

		if (wLen >= 5) {
			// 2 char replace
			genCount += genRetry(word, 1, 2, 1+Math.floor(wLen / 4), 10, 1);
		}

		if (wLen > 7) {
			// 3 char replace
			genCount += genRetry(word, 1, 3, Math.floor(wLen / 8), 10, 1);
		}

		// Combine words
		//console.log("word combination");
		let idx = Math.floor(Math.random() * wordsLen);
		//console.log("FUCK", wordDict, idx);
        let len1 = ((0.75 + Math.random()) * wLen) / 2;
        let len2 = ((0.25 + Math.random()) * wLen) / 2;
		let badWord = word.substr(0, len1) + wordDict[idx][0].substr(-len2);
		
		addWord(badWord, 7);

	//}
	return result;
}

function createHashIndex(arr) {
	let idx = {};
	for (let i = 0, len = arr.length; i < len; i++) {
		/*if (i % 1000 === 0) {
			console.error(100*i/len + '%');
		}*/
		idx[arr[i]] = 1;
	}
	return idx;
}

function interleaveArr(arr1, arr2) {
	let ins1 = 0;
	let ins2 = 0;
	let len1 = arr1.length,
		len2 = arr2.length;

	if (len1 === 0) {
		return arr2;
	} else if (len2 === 0) {
		return arr1;
	}

	let result = new Array(len1 + len2); 
	//  [1,2] [10,11,12,13]
	//  [1,10,11,2,12,13]

	for (let i = 0, len = result.length; i < len; i++) {
		//if (ins1*len <= i*len1) {
		if (ins1*len2 <= ins2*len1) {
			//console.log(i, 'ins1', ins1);
			result[i] = arr1[ins1];
			ins1++;
		} else {
			//console.log(i, 'ins2', ins2);
			result[i] = arr2[ins2];
			ins2++;			
		}
		//console.log('RES:', result);
	}

	return result;
}


module.exports = {
	interleaveArr: interleaveArr,
	makeBadWords: makeBadWords,
	makeBadWord: makeBadWord,
	charToCode: charToCode
};

if (!module.parent) {
    process.on('uncaughtException', function (err) {
        console.log('Caught exception: ' + err);
    });

	// direct call
	if (process.argv.length < 3) {
		console.log('Call as: node gendata.js <dict.txt> <external.json>');
		console.log('Produces 3 files: train.csv, validate.csv, test.csv');
		process.exit(1);
	}

	let args = process.argv.slice(2);
	console.error('Loading bad json');
	let badWords = require(/*'./bad.json'*/ args[1]);
console.error('Loading csv');
	Promise.all([
		readTxt(/*path.resolve(__dirname, 'words.txt')*/ args[0])
		])
	.then((args) => {
		let goodWords = args[0];

		//goodWords = goodWords.filter(lenFilter);
		// shuffleArray(goodWords);
		console.error('Creating good index');
		let goodIdx = createHashIndex(goodWords);
		console.error('Converting good words into vector');
		goodWords = goodWords.map((word) => {
			return [word, 1, 1, 0];
		});
		
		//badWords = badWords.filter(lenFilter);
		// shuffleArray(badWords);
		console.error('Creating bad index');
		let badIdx = createHashIndex(badWords);

		badWords = badWords.map((word) => {
			return [word, 0, 2, 0];
		});

		// Generate more bad words!
		let words = [];
		console.error('Generating bad words');
		for (let i = 0, len = goodWords.length; i < len; i++) {
			if (i % 10000 === 0) {
				console.error((i/len*100).toFixed(3) + '%');
            }

			let word = goodWords[i];
			words.push(word);
			//console.log(words);
			var bad = makeBadWords(word[0], goodIdx, badIdx, goodWords);
			if (bad.length) {
				//console.error(bad.length + ' bad for ' + word[0]);
				bad = bad.map((x) => {
					return [x[0], 0, 3, x[1]];
				});
				words.push.apply(words, bad);
			} else {
                console.error('No bad for ' + word[0]);
            }
		}
			console.error('interleave');
		//console.log('!!', bad);
		
		/*words.map((word) => {
			return [word[0], false, 3, word[1]];
		});*/
		//console.log(words);
		//console.log(words, badWords);
		let result = interleaveArr(words, badWords);
		
		return Promise.resolve(result);

	}).then((words) => {
		//console.log(words);
		words = words.filter((x) => {
			return lenFilter(x[0]);
		});

		shuffleArray(words);
		//console.log(words);
		
		//let trainCount = Math.round(words.length * 0.7);
		//csv.from.array(words.slice(0, trainCount)).to.path('./train.csv');
		//csv.from.array(words.slice(trainCount)).to.path('./validate.csv');
		//csv.from.array(test).to.path('./test.csv');
//console.log('fuck');
		//console.log(words);
		// write 3 files
		for (let i = 0, len = words.length; i < len; i++) {
			let word = words[i];
			console.log([
				word[0], // word
				word[1] ? '1' : '0', // 1-valid, 0-invalid
				word[2], // source 
				word[3] // error class
			].join(','));
		}
	});
}
