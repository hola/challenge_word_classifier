var fs = require('fs');
var https = require('https');
var wordClassifier = require('./word_classifier');
var dictionaryFile = './data';

function sampleTest(data) {
    var i = '';
    
    var fail = 0;
    var success = 0;

    var result = false;

    data = JSON.parse(data, true);

    console.log('');

    for (i in data) {
        if (data.hasOwnProperty(i)) {
            result = wordClassifier.test(i);

            console.log('\'' + i + '\' | expected: ' + data[i] + ' is: ' + result);

            if (result === data[i]) {
                success += 1;
            } else {
                fail += 1;
            }
        }
    }
    console.log('');
    console.log('Success: ' + success);
    console.log('Fail: ' + fail);
}

function onLoadTestData(res) {
    console.log('* downloading sample data');
    res.on('data', function(d) {
        if (res.statusCode === 302) {
            console.log('* redirected to ' + res.headers.location);
            https.get('https://hola.org' + res.headers.location, onLoadTestData);
        } else if (res.statusCode === 200) {
            sampleTest(d.toString('utf8'));
        } else {
            console.log(res.stastusCode);
            console.log('cannot load test data from hola.org');
        }
    })
}

function loadTestData() {
    console.timeEnd('** load time');
    https.get('https://hola.org/challenges/word_classifier/testcase', onLoadTestData);
}

function onLoadDictionary(err, data) {
    'use strict';
    if (err) {
        throw err;
    }

    wordClassifier.init(new Buffer(data));
    loadTestData();
}

function loadDictionary() {
    'use strict';
    fs.readFile(
        dictionaryFile,
        'utf8',
        onLoadDictionary
    );
}

console.time('** load time');

loadDictionary();