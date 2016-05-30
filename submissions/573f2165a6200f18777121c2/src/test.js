var fs = require('fs'),
    module = require('./module.js'),
    request = require('request'),
    async = require('async'),
    util = require('util'),
    zlib = require('zlib');

var data = fs.readFileSync('./data.gz');

START_ID = 1;
COUNT = 100;
URL_PREFIX = 'https://hola.org/challenges/word_classifier/testcase/';

module.init(zlib.gunzipSync(data));

var count = 0, errored = 0;

var links = [];
for(var i = START_ID; i < START_ID + COUNT; i++) {
    links.push(util.format("%s%d", URL_PREFIX, i));
}

async.each(links, function iteratee(item, callback) {
    request.get(item, function(error, response, body) {
        var data = JSON.parse(body);
        for(var key in data) {
            count++;
            var res = module.test(key);
            if(data[key] != res) {
                errored++;
            }
        }
        callback(null);
    });
}, function done(err, result) {
    if(err) {
        console.log(err);
        return;
    }
    console.log(util.format("cnt: %d; err: %d; acc: %d", count, errored, (100 - (errored / count) * 100)));
});