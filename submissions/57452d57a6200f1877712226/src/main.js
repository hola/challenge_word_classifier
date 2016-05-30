// Lets do some tests
// var tester = require('./tester');
// tester.startTest(1000);

//var neuro_network = require('./neuro_network');
//neuro_network.startLearning(50);
var request = require('request');
var fs = require('fs');
var Sync = require('sync');

Sync(function () {
    var testCount = 500;
    for (var testNum = 0; testNum < testCount; testNum++) {
        console.log('-------------------------------');
        console.log('Start test ' + (testNum + 1) + ' of ' + testCount);

        var testcase = request.sync(null, 'http://hola.org/challenges/word_classifier/testcase');
        if (testcase[0].statusCode !== 200) {
            throw new Error('Can not get test from hola');
        }

        fs.writeFile.sync(null, 'testcases/' + (1100+testNum) + '.json', testcase[1], 'utf8');
    }
}, function (err) {
    if (err) {
        console.error(err);
        console.error(err.stack);
    }
});
