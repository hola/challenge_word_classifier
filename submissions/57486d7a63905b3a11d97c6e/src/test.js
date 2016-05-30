const testcase = require('./testcase');
const classifier = require('./classifier.js');
const fs = require('fs');
const zlib = require('zlib');

fs.readFile('./data', (err, data) => {
    zlib.gunzip(data, (err, buffer) => {
        classifier.init(buffer);
    
        var result = 0, all = 0;
        testcase.on('test', (word, rate) => {
            var classifierRate = classifier.test(word);
            console.log(word, rate, classifierRate);
            if(classifierRate === rate) {
                result++;
            }
            all++;
        });
        testcase.on('end', () => {
            console.log('result', result + '/' + all);
        });
        testcase.on('error', (err) => {
            console.error(err);
        });
        testcase.run();     
    });
});