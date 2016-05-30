'use strict';

const fs = require('fs');
const filter = require('./filter.js');
const request = require('request');

const data = fs.readFileSync('words.out');
filter.init(data);

// read data from url
request.get('https://hola.org/challenges/word_classifier/testcase',
    function(err, resp, body){
        let obj = JSON.parse(body);
        let goods = 0;
        Object.keys(obj).forEach(w=>{
            goods += (obj[w] == filter.test(w)) ? 1 : 0;
        });
        console.log('ratio: ', goods / Object.keys(obj).length);
    });
