var base = require('./base.min');
var fs = require('fs');
var request = require("request");

var util = require('util');

fs.readFile( __dirname + '/out.txt', function (err, data) {
    if (err) {
        throw err;
    }
    base.init(data);

    var url = "https://hola.org/challenges/word_classifier/testcase";

    var errorCount = 0;
    var totalCount = 0;
    var posTestResultCount = 0;
    var negTestResultCount = 0;
    request({
        url: url,
        json: true
    }, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            for (var key in body) {
                var testResult = base.test(key);
                if (body[key] !== testResult) {
                    if (testResult) {
                        posTestResultCount += 1;
                    } else {
                        negTestResultCount += 1;
                    }
                    console.log(key, body[key], testResult);
                    errorCount += 1;
                }
                totalCount += 1;
            }

            console.log('Процент правильныйх ответов', 100 - errorCount / totalCount * 100, '%', posTestResultCount, negTestResultCount)
        }
    });

    base.test('overintellectualism')

});


