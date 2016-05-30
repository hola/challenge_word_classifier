var Chance = require('chance');
var chance = new Chance();
var bullshit = require('./bullshit.js');
var fs = require('fs');
var wc = 10000;
var _  = require('lodash');

var contents = fs.readFileSync('words.txt', 'utf-8');
var ar = contents.split('\n');

var log = [];

bullshit.init(fs.readFileSync('words4'));

var positive = 0;
for (var i = 0; i < wc; i++) {
    var word = ar[Math.floor(Math.random() * ar.length)]
    if (bullshit.test(word)) {
        log.push('(+)+ ' + word);
        positive++;
    } else {
        log.push('(+)- ' + word);
    }
}

for (var i = 0; i < wc; i++) {
    var word = chance.word({
        length: Math.floor(Math.random() * 10) + 4
    });
    if (!bullshit.test(word)) {
        log.push('(-)- ' + word);
        positive++;
    } else {
        log.push('(-)+ ' + word);
    }
}

_.shuffle(log).slice(-100).map(function (r) {
    console.log(r);
});

console.log('-----------------------------------');
console.log(Math.floor((positive / (wc * 2))* 100) + '%');
