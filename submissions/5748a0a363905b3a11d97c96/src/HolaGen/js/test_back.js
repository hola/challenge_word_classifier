var fs = require('fs');
var path = require('path');
var zlib = require('zlib');
var id = "246";
var module = require('../../temp/ID' + id + '/index.js');
var dataPath = '../../temp/ID' + id + '/data.gz';

function test() {
    var gzipped = fs.readFileSync(dataPath);
    var buffer = zlib.gunzipSync(gzipped);
    if (module.init) {
        module.init(buffer);
    }

    var testCasesDir = '../../testcases';
    var testCases = fs.readdirSync(testCasesDir)
        .sort()
        // .slice(6, 7)
        ;
    var totalScore = 0;
    //var results = [];
    testCases.forEach(function (testCase) {
        var filename = path.join(testCasesDir, testCase);
        var data = require('./' + filename);
        var score = 0;

        Object.keys(data).forEach(function (word) {
            // word = "aq's";
            var result = Boolean(module.test(word));
            var success = result == data[word];
            //results.push(`${word} - ${result} - ${success}`);
            // console.log({word, result, success});
            if (success) {
                score++;
            }
        });

        // console.log("score: ", score);
        totalScore += score;
    });

    // fs.writeFileSync('c:/temp/results-js.txt', results.join('\n'));

    var avgScore = totalScore / testCases.length;
    console.log("avg score: ", avgScore);
}

test();