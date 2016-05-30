var fs = require('fs');
var http = require('follow-redirects').http;
var https = require('follow-redirects').https;

var data = fs.readFileSync('bits');

var M = require('./module');
M.init(data);

var url = 'https://hola.org/challenges/word_classifier/testcase';

var good = 0.0;
var bad = 0.0;
var total = 0.0;
var false_positives = 0.0;
var false_negatives = 0.0;
var correct_words = 0.0;
var incorrect_words = 0.0;

function runTests(list) {
    for (var k in list) {
        var b = M.test(k);
        var l = list[k];
        if (l) {
            correct_words += 1;
        } else {
            incorrect_words += 1;
        }
        if (b == l) {
            good += 1;
        } else {
            bad += 1;
            if (b) {
                false_positives += 1;
            } else {
                false_negatives += 1;
            }
        }
        total += 1;
    }
    console.log("\nGot: " + Math.round(100 * good / total) + "%");
    console.log("False positives: " + Math.round(100 * false_positives / bad) + "%");
    console.log("False negatives: " + Math.round(100 * false_negatives / bad) + "%");
    console.log("Correct words: " + Math.round(100 * correct_words / (correct_words + incorrect_words)) + "%");
    console.log("Incorrect words: " + Math.round(100 * incorrect_words / (correct_words + incorrect_words)) + "%");
}

function testGroup() {
    https.get(url, function (res) {
        var body = '';

        res.on('data', function (chunk) {
            body += chunk;
        });

        res.on('end', function () {
            var obj = JSON.parse(body);
            // console.log("Got a response: ", obj);
            runTests(obj);
        });
    }).on('error', function (e) {
        console.log("Got an error: ", e);
    });
}

for (var x = 0; x < 1; x++) {
    // console.log(x + 1);
    testGroup();
}




