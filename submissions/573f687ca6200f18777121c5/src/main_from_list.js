var base = require('./base.min');
var fs = require('fs');
var util = require('util');
var zlib = require('zlib');

fs.readFile( __dirname + '/out.zip', function (err, data) {
    if (err) {
        throw err;
    }
    data = zlib.gunzipSync(data);
    base.init(data);

    fs.readFile( __dirname + '/list.txt', function (err, list) {
        if (err) {
            throw err;
        }
        var body = JSON.parse(list);
        var errorCount = 0;
        var totalCount = 0;
        var posTestResultCount = 0;
        var negTestResultCount = 0;

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

    });
});


