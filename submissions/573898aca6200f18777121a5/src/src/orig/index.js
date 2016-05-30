#!/usr/bin/env node

var fs = require('fs'),
    path = require('path'),
    words = {};

fs.readFileSync(path.join(__dirname, '../../data/words-lower.txt')).toString().split('\n').forEach(function (word) {
    if (word) { // skip last line
        words[word] = true;
    }
});

function init()
{
}

function test(word)
{
    return typeof words[word] !== 'undefined';
}

exports.init = init;
exports.test = test;
