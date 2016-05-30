'use strict';

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/hola');
const BookWordModel = require('../db-models/BookWord');


const lenCounts = new Array(61).fill(0);
const abcStartCount = {};
'abcdefghijklmnopqrstuvwxyz\''.split('').forEach(char => abcStartCount[char] = 0);
const abcEndCount = {};
'abcdefghijklmnopqrstuvwxyz\''.split('').forEach(char => abcEndCount[char] = 0);
const abc4Count = {};
'abcdefghijklmnopqrstuvwxyz\''.split('').forEach(char => abc4Count[char] = 0);
const abc2Count = {};
'abcdefghijklmnopqrstuvwxyz\''.split('').forEach(char => abc2Count[char] = 0);
const abc1Count = {};
'abcdefghijklmnopqrstuvwxyz\''.split('').forEach(char => abc1Count[char] = 0);
const abc3Count = {};
'abcdefghijklmnopqrstuvwxyz\''.split('').forEach(char => abc3Count[char] = 0);

const loadBookWords = () => new Promise((resolve, reject) => {
	BookWordModel
	.find()
	.sort({ word: 1 })
	.stream()
	.on('data', doc => {
    lenCounts[doc.word.length] ++;
    abcStartCount[doc.word[0]] ++;
    abcEndCount[doc.word[doc.word.length - 1]] ++;
    if(doc.word[4])
      abc4Count[doc.word[4]] ++;
    if(doc.word[2])
      abc2Count[doc.word[2]] ++;
    if(doc.word[1])
      abc1Count[doc.word[1]] ++;
    if(doc.word[3])
      abc3Count[doc.word[3]] ++;
	})
	.on('error', err => {
		reject(err);
	})
	.on('close', () => {
		resolve();
	});
});

//------------------------------------------------------------------------------
loadBookWords()
.then(() => {
  const wordsCount = lenCounts.reduce((sum, lenCount) => sum + lenCount, 0);
  console.log(`Total: ${wordsCount}`);
  console.log(`lenCounts: -------------------`);
  lenCounts.forEach((lenCount, idx) => {
    console.log(`${idx}:\t${lenCount}\t${(lenCount / wordsCount * 100).toFixed(2)}%`);
  });
  console.log(`abcStartCount: -------------------`);
  Object.keys(abcStartCount).sort((a, b) => abcStartCount[a] - abcStartCount[b]).forEach(key => {
    console.log(`${key}:\t${abcStartCount[key]}\t${(abcStartCount[key] / wordsCount * 100).toFixed(2)}%`);
  });
  console.log(`abcEndCount: -------------------`);
  Object.keys(abcEndCount).sort((a, b) => abcEndCount[a] - abcEndCount[b]).forEach(key => {
    console.log(`${key}:\t${abcEndCount[key]}\t${(abcEndCount[key] / wordsCount * 100).toFixed(2)}%`);
  });
  console.log(`abc4Count: -------------------`);
  Object.keys(abc4Count).sort((a, b) => abc4Count[a] - abc4Count[b]).forEach(key => {
    console.log(`${key}:\t${abc4Count[key]}\t${(abc4Count[key] / wordsCount * 100).toFixed(2)}%`);
  });
  console.log(`abc2Count: -------------------`);
  Object.keys(abc2Count).sort((a, b) => abc2Count[a] - abc2Count[b]).forEach(key => {
    console.log(`${key}:\t${abc2Count[key]}\t${(abc2Count[key] / wordsCount * 100).toFixed(2)}%`);
  });
  console.log(`abc1Count: -------------------`);
  Object.keys(abc1Count).sort((a, b) => abc1Count[a] - abc1Count[b]).forEach(key => {
    console.log(`${key}:\t${abc1Count[key]}\t${(abc1Count[key] / wordsCount * 100).toFixed(2)}%`);
  });
  console.log(`abc3Count: -------------------`);
  Object.keys(abc3Count).sort((a, b) => abc3Count[a] - abc3Count[b]).forEach(key => {
    console.log(`${key}:\t${abc3Count[key]}\t${(abc3Count[key] / wordsCount * 100).toFixed(2)}%`);
  });
})
.then(() => {
	console.log(`OK`);
	process.exit(0);
})
.catch(err => {
	console.log(`ERROR: ${err}`);
	process.exit(0);
});



// 630403
// Total: 661687 | 661634
// 2:      1222    2444
// 3:      6302    18906   <--
// 4:      13870   55480
// 5:      29319   146595
// 6:      52747   316482
// 7:      74137   518959
// 8:      89157   713256
// 9:      91447   823023
// 10:     83523   835230
// 11:     68250   750750
// 12:     52066   624792
// 13:     36982   480766
// 14:     25206   352884
// 15:     16107   241605
// 16:     9848    157568
// 17:     5542    94214
// 18:     2972    53496
// 19:     1572    29868
// 20:     711     14220
// 21:     349     7329    <--
// 22:     152     3344
// 23:     68      1564
// 24:     38      912
// 25:     18      450
// 26:     3       78
// 27:     5       135
// 28:     3       84
// 29:     6       174
// 30:     2       60
// 31:     2       62
// 32:     1       32
// 33:     1       33
// 34:     2       68
// 45:     2       90
// 58:     1       58
// 60:     1       60
