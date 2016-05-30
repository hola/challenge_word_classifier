var fs = require('fs');
var https = require('https');
var wordClassifier = require('./word_classifier');


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

function onLoad(res) {
    console.log('* downloading sample data');
    res.on('data', function(d) {
        if (res.statusCode === 302) {
            console.log('* redirected to ' + res.headers.location);
            https.get('https://hola.org' + res.headers.location, onLoad)
        } else if (res.statusCode === 200) {
            sampleTest(d.toString('utf8'));
        } else {
            console.log(res.stastusCode);
            console.log('cannot load test data from hola.org');
        }
    })
}

function onInitialized() {
    console.timeEnd('** load time');
    https.get('https://hola.org/challenges/word_classifier/testcase', onLoad);
}


console.time('** load time');
wordClassifier.init().then(onInitialized);