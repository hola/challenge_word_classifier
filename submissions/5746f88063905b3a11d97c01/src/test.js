"use strict";
var fs = require('fs');
var glob = require('glob');
var zlib = require('zlib');
var Files = glob.sync('./dump/*.json');
var NFiles = parseInt(process.argv[2]);
if (!NFiles) { NFiles = Files.length; }
console.log('Files:',NFiles);
var mod = require('./solution.js');
var data = fs.readFileSync('./data.gz');
data = zlib.gunzipSync(data);
if (mod.init)
    mod.init(data);
var NB=0;
var N=0;
var Fp=0;
var Fn=0;
for (let testfile of Files) {
	if (++NB > NFiles) { break; }
	let json = fs.readFileSync(testfile);
	let block = JSON.parse(json);
	let C=0;
	for (let testword in block) {
                let value = block[testword];
		let guess = mod.test(testword);
		N++;
		if (value!=guess) { 
			guess ? Fp++ : Fn++;
		}
		
	}
}

console.log('Words tested:', N);
console.log('FP:', Fp, 'FN:', Fn);
console.log('Rate:', (N-Fp-Fn)/N);
