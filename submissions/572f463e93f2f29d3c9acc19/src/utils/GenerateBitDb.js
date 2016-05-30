var fs = require('fs');
var stream = require('stream');
var readline = require('readline');
var appConfig = require('../app.config.js').appConfig;
var fileUtils = require('./FileUtils.js');
var executeTest = require('./ExecuteTest.js');
var BloomFilter = require('../bloom/BloomFilter.js');
var bloomFilter = new BloomFilter();

// var DB_FILE = './db/words_test.txt';

var words = {
    "AAMSI": true,
    "wordm": false,
    "infernalism": true
};

var writeToFile = function () {
    var buffer = fileUtils.arrayToBuffer(bloomFilter.get());
    fs.writeFile(appConfig.DB_FILE_PATH, buffer, function (err) {
        if (err) throw err;
        console.log('Done Writing!');
    });
}

var test = function () {
    executeTest(function (data) {
        // var data = words;
        var correct = 0;
        var total = 0;
        for (var word in data) {
            console.log(word, word.length, bloomFilter.test(word), data[word]);
            correct += (bloomFilter.test(word) === data[word] ? 1 : 0);
            total++;
        }
        console.log(correct, total);
    });
}

var generateData = function () {
    var instream = fs.createReadStream(appConfig.WORDS_INPUT);
    var rl = readline.createInterface({
        input: instream,
    });

    var i = 0;
    rl.on('line', function (word) {
        bloomFilter.add(word);
        // console.log(word);
        i++;
    });

    rl.on('close', function () {
        test();
        writeToFile();
        console.log('Done', i);
    });
}

module.exports = generateData;
