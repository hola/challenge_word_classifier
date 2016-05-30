'use strict';

//const TEST_CASE_URL = 'https://hola.org/challenges/word_classifier/testcase';
const TEST_CASE_BASE_URL = 'https://hola.org/challenges/word_classifier/testcase/818661000';
const DICT_FILE_GZ = './data.gz';
const NUM_CYCLES = 100;

const cl = require('./solution');
const request = require('request-promise');
const _ = require('lodash');
const Q = require('q');
const fs = require('fs');
const zlib = require('zlib');

cl.init(zlib.gunzipSync(fs.readFileSync(DICT_FILE_GZ)));

function testCase(url) {
    return request.get({
        url: url,
        json: true
    }).then(data => {
        let guess = 0;
        _.each(data, (answer, word) => {
            if (answer === cl.test(word)) {
                guess++;
            }
        });
        return guess;
    });
}

let totalGuess = 0;
let promise = Q.when();
for (let i = 0; i < NUM_CYCLES; i++) {
    (function(i) {
        promise = promise.then(() => {
            return testCase(TEST_CASE_BASE_URL + i).then(guess => {
                console.log(i + ':', guess + '%');
                totalGuess += guess;
            });
        });
    })(i);
}
promise = promise.finally(() => {
    console.log('Total percent:', (Math.round(100 * totalGuess / NUM_CYCLES) / 100) + '%');
});
