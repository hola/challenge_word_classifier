var _ = require('lodash');
var fs = require('fs');

var contents = fs.readFileSync('words.txt', 'utf-8');
var ar = contents.split('\n');

// for (var i = 0; i < 50; i++)
//     console.log(ar[Math.floor(Math.random() * ar.length)]);

var arr = _.shuffle(ar.filter(function (e) {
    if (e.indexOf('\'') !== -1 || e.match(/^[A-Z]+$/)) {
        return false;
    }
    return e.length === 4;
})).slice(0, 9001);

fs.writeFileSync('words4', arr.join('\n'), 'ascii');
