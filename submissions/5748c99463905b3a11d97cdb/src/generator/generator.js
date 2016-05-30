fs = require('fs');
zlib = require('zlib');

/*https://github.com/cscott/lzma-purejs
Copyright (c) 2011 Gary Linscott
Copyright (c) 2011-2012 Juan Mellado
Copyright (c) 2013 C. Scott Ananian
All rights reserved.
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.*/
lzmajs = require('lzma-purejs');


var unrealPairs = {};
var unrealPairsTmp = 'qjqzqxjqjzjxzxxjvqvjwxqpqhqygxhxqvwqqgvbqcqkkxzjvxqfpxvwqnxzfqjvfxgqcxxkkzqbcjbxqmqdjbkqsxjgpqfvtxqwfzmxqqqlqtjfjwdxvfvzqowjpzjmbqzqjtyqqrqejjzfjlxqmqjpvpjhvhbzjyxgfjxrvgtqjkdqxxxnvmlxqsjczgyjxdjrrxxvwvcvjsjdvchqzpgvmzgzyypvhjjnlqvtzvhzvkmjwzgjvdzrfgzdpjfkcwzcxwztqizwfwljznzsfpcfkjvn'.replace(/(..)/g, '$&,').split(',');

for (var i = 0; i < unrealPairsTmp.length; i++) {
	unrealPairs[unrealPairsTmp[i]] = true;
}


var globSize, globSeed, log = [];

var template = fs.readFileSync('../template.js', 'utf8');


var prime = readData('./prime.txt'),
	good = readData('./good.txt'),
	good1 = readData('./good1.txt'),
	bad1 = readData('./bad1.txt');


var partsTemp400 = readData('./parts400'),
	partsTemp500 = readData('./parts500'),
	partsTemp600 = readData('./parts600'),
	partsTemp700 = readData('./parts700'),
	partsTemp800 = readData('./parts800'),
	partsTemp900 = readData('./parts900'),
	partsTemp1000 = readData('./parts1000'),
	partsTemp1100 = readData('./parts1100');


var parts = [[], [], [], [], [], [], [], [], [], [], [], [], [], []];
for (var i = 0; i < partsTemp400.length; i++) {
	parts[0].push(partsTemp400[i].split(' ')[0]);
}
for (var i = 0; i < partsTemp500.length; i++) {
	parts[1].push(partsTemp500[i].split(' ')[0]);
}
for (var i = 0; i < partsTemp600.length; i++) {
	parts[2].push(partsTemp600[i].split(' ')[0]);
}
for (var i = 0; i < partsTemp700.length; i++) {
	parts[3].push(partsTemp700[i].split(' ')[0]);
}
for (var i = 0; i < partsTemp800.length; i++) {
	parts[4].push(partsTemp800[i].split(' ')[0]);
}
for (var i = 0; i < partsTemp900.length; i++) {
	parts[5].push(partsTemp900[i].split(' ')[0]);
}
for (var i = 0; i < partsTemp1000.length; i++) {
	parts[6].push(partsTemp1000[i].split(' ')[0]);
}
for (var i = 0; i < partsTemp1100.length; i++) {
	parts[7].push(partsTemp1100[i].split(' ')[0]);
}



function readData(fname) {
	var data = fs.readFileSync(fname, 'utf8');

	data = data.replace(/\r\n/g, '|');
	data = data.replace(/\n\r/g, '|');
	data = data.replace(/\r/g, '|');
	data = data.replace(/\n/g, '|');

	return data.split('|');
}


function getHash(str) {

	var hash = globSeed;

	for (var i = 0; i < str.length; i++) {
		hash = str.charCodeAt(i) + (hash << 6) + (hash << 15) - hash;
	}

	hash = hash % globSize;
	if (hash < 0) {
		hash += globSize;
	}

	return hash;
}


function testBloom(str) {

	var ngrams = splitToNGrams(str);

	for (var i = 0; i < ngrams.length; ++i) {
		var ind = getHash(ngrams[i]);
		if (!((bits[Math.floor(ind / 32)] >>> (ind % 32)) & 1)) return false;
	}

	return true;
}


function setBloom(str) {

	var ind = getHash(str);

	bits[Math.floor(ind / 32)] |= 1 << (ind % 32);
}


function minifyMap(map) {
	var s = '';
	for (var i = 0; i < map.length; i++) {
		var b = map[i];
		s += String.fromCharCode(b & 0x000000FF);
		b = b >> 8;
		s += String.fromCharCode(b & 0x000000FF);
		b = b >> 8;
		s += String.fromCharCode(b & 0x000000FF);
		b = b >> 8;
		s += String.fromCharCode(b & 0x000000FF);
	}

	return s;
}


function splitToNGrams(word) {
	var res = [],
		ind = 0,
		wlen = word.length;

	while (true) {
		var s = word.substr(ind, globN);

		if (s != '') res.push(ind + s);

		if (ind + globN == word.length) break;

		ind += globS;
		if (s.length < globN) break;
	}

	return res;
}


function random(st, ed) {
	return Math.floor(Math.random() * (ed - st + 1)) + st;
}



var bestPerM = 0,
	centerSt = [ 30,  27,  22,  28,  25,  20,   15,   12],
	centerEd = [ 100,  90,  85,  85,  75,  70,   75,   65];


for (var kk = 0; kk < 50000; kk++) {

	var globPart = random(0,7),
		globPartLength = random(centerSt[globPart], centerEd[globPart]),
		globMaxLen = random(16, 22),
		globN = random(6, 8),
		globS = random(6, 8);


/*	globPart = 2;
	globPartLength = 39;
	globMaxLen = 16;
	globN = 7;
	globS = 7;*/



	var partsReg = [];
	for (var j = 0; j < globPartLength; j++) {
		if (parts[globPart][j] != 's$')
			partsReg.push(new RegExp(parts[globPart][j]));
	}
	partsReg.push(new RegExp('s$'));



	var learningGood = [];
	for (var i = 0, l1 = good.length; i < l1; i++) {
		var gd = good[i],
			f = false;

		if (evristic(gd) === true || evristic(gd) === false) continue;

		for (var j = 0; j < partsReg.length; j++) {
			if (partsReg[j].test(gd)) {
				f = true;
				break;
			}
		}

		if (f) continue;

		learningGood.push(gd);
	}



	var goodList1 = filterList(good1),
		badList1 = filterList(bad1);
	function filterList(list) {
		var res = [];

		for (var i = 0, l = list.length; i < l; i++) {
			var gd = list[i], used = [];

			for (var j = 0; j < partsReg.length; j++) {
				if (!used[j] && partsReg[j].test(gd)) {
					gd = gd.replace(partsReg[j], '');
					used[j] = 1;
					j = -1;
				}
			}
			res.push(gd);
		}
		return res;
	}




	var ngrams = [];
	for (var i = 0; i < learningGood.length; i++) {
		var ngram = splitToNGrams(learningGood[i]);
		for (var j = 0; j < ngram.length; j++) {
			ngrams.push(ngram[j]);
		}
	}


	for (var k = 0; k < 100; k++) {

		var packed1, packed2,
			size1 = 400000, size2 = 700000;



		if (k == 0) globSize = size1;
		if (k == 1) globSize = size2;
		if (k == 2) {
			var per = (65536-122-packed1) / (packed2 - packed1),
				x = Math.floor((size2 - size1) * per + size1);

			globSize = random(x - 10000, x + 10000);
		}
		if (k > 2) {
			var per = (65536-122-packed1) / (packed.length - packed1),
				x = Math.floor((globSize - size1) * per + size1);

			globSize = random(x - 10000, x + 10000);
		}

		for (var p = 0; p < prime.length; p++) {
			if (prime[p] - 0 >= globSize) {
				globSize = prime[p] - 0;
				break;
			}
		}

		globSeed = Math.random() > 0.5 ? prime[Math.floor(Math.random() * 100000)] - 0 : Math.floor(Math.random() * 600000);
		if (Math.random() < 0.1) globSeed = 0;


/*		globSeed = 411742;
		globSize = 505213;*/


		var bits = [];
		for (var i = 0; i < ngrams.length; i++) {
			setBloom(ngrams[i]);
		}



		var rightg1 = 0,
			rightb1 = 0;

		var known = {};
		var len = Math.min(goodList1.length, badList1.length);

		for (var i = 0; i < len; i++) {
			if (isEng(goodList1[i], good1[i])) rightg1++;
			if (!isEng(badList1[i], bad1[i])) rightb1++;
		}


		var partsRegStr = partsReg.join(','),
			map = minifyMap(bits);


		var templ = template.replace('"<seed>"', globSeed);
		templ = templ.replace('"<size>"', globSize);
		templ = templ.replace('"<globN>"', globN);
		templ = templ.replace('"<globN>"', globN);
		templ = templ.replace('"<globN>"', globN);
		templ = templ.replace('"<globS>"', globS);
		templ = templ.replace('"<globMaxLen>"', globMaxLen);
		templ = templ.replace("<filter>", partsRegStr.replace(/\//g, ''));


		var data = new Buffer(map, 'utf8');
		var compressed = lzmajs.compressFile(data);
		var newBuffer = Buffer.concat([compressed, new Buffer('qqqqq' + templ, 'utf8')]);

		packed = zlib.gzipSync(newBuffer, {
			level: 9,
			memLevel: 9,
			strategy: 1
		});


		var per = (rightg1 + rightb1) / (len * 2);
		log.push((Math.floor(10000 * rightg1 / (len)) / 100));
		log.push(Math.floor(10000 * rightb1 / (len)) / 100);
		log.push(Math.floor(10000 * per) / 100);
		log.push(packed.length);
		log.push(0);
		log.push(globSize);
		log.push(globMaxLen);
		log.push(globSeed);
		log.push(globN);
		log.push(globS);
		log.push(globPart);
		log.push(globPartLength);

		if (bestPerM < per && packed.length + 122 <= 65536) {
			bestPerM = per;
			fs.writeFileSync('./data' + (100*bestPerM).toFixed(3).replace('.', ',') + '.gz', packed);

			console.log('best!  ' +  per);
		}

		console.log(log.join('\t'));

		if (k == 0) packed1 = packed.length;
		if (k == 1) packed2 = packed.length;
		log = [];
	}
}



function isEng(word, original) {
	known[original] = (known[original] || 0) + 1;

	if (original == "'") return false;

	//if (known[original] > 1 && original.length > 7) return true;

	var evr = evristic(original);

	if (typeof evr == 'boolean') return evr;

	return testBloom(word, original);
}


function evristic(w) {

	var wl = w.length;

	if (wl < 3) return true;

	if (wl > globMaxLen) return false;

	for (var j = 0; j < wl - 1 ; j++)
		if (unrealPairs[w.substr(j, 2)]) return false;

	if (w.replace(/'s$/,'').indexOf("'")+1) return false;

	return 1;
}
