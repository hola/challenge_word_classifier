"use strict"
var fs = require('fs');
var words = fs.readFileSync('words.txt', 'ascii');
words = words.toLowerCase();
var size = 742592;
var seed = Math.floor(0.1 * 64) + 64;
var bits = [];
words
    .split('\n')
    .filter(function (item) {
        return item.indexOf("'") === -1;
    }).forEach(function (word) {
        var result = 1;
        for (var i = 0; i < word.length; ++i) {
            result = (seed * result + word.charCodeAt(i)) & 0xFFFFFFFF;
        }
        if (result < 0){
            result=Math.pow(result, 2)
		}
        result = result % size;
        bits[Math.floor(result / 64)] |= 1 << (result % 64);
    });
fs.writeFileSync('newWords.txt', bits.join('\n'), 'ascii');
