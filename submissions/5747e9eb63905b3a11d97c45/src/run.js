var fs = require('fs');
var zlib = require('zlib');

var module = require('./test.js');

if (module.init) {
    var data = fs.readFileSync('data.gz'); // optional
    data = zlib.gunzipSync(data); // optional
    module.init(data);
}

var totalCorrect = 0;
var totalQty = 0;

var files = fs.readdirSync('../download/tests/');
files.forEach(function (file) {
//    if(parseInt(file) > 20000){
//        return;
//    }
    var correct = 0, total = 0;
    var data = JSON.parse(fs.readFileSync('../download/tests/' + file));

    //console.log('');
    //console.log('word                         ' + ' : data  : result');
    Object.keys(data).forEach(function (word) {
        total++;
        var result = module.test(word),
                shouldBe = data[word];
        if (result === shouldBe) {
            correct++;
        } else {
            shouldBe = (shouldBe + '  ').substr(0, 5);
            word = (word + '                            ').substr(0, 30);
            //console.log(word + ': ' + shouldBe + ' : ' + result);
        }
    });
    //console.log(file + ': ' + (Math.round(correct * 100 / total) + '%'));

    totalCorrect += correct;
    totalQty += total;
});
console.log('');
console.log('Test correct/incorrect words - ' + ((totalCorrect * 100 / totalQty).toFixed(4) + '%'));

var correctWords = require('../words.json');

totalCorrect = 0;
totalQty = 0;

correctWords.forEach(function (word) {
    totalQty++;
    if (module.test(word)) {
        totalCorrect++;
    }
});
console.log('');
console.log('Test correct words           - ' + ((totalCorrect * 100 / totalQty).toFixed(4) + '%'));

var incorrectWords = require('../words-incorrect.json');
var tc = totalCorrect, tq = totalQty;
totalCorrect = 0;
totalQty = 0;

incorrectWords.forEach(function (word) {
    totalQty++;
    if (!module.test(word)) {
        totalCorrect++;
    }
});
console.log('');
console.log('Test incorrect words         - ' + ((totalCorrect * 100 / totalQty).toFixed(4) + '%'));

console.log('');
console.log('Average correctness          - ' + (((tc / tq + totalCorrect / totalQty) * 50).toFixed(4) + '%'));