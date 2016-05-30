#!/usr/bin/env node

var BITS = 19;

var fs = require('fs'),
    path = require('path'),
    buf = Buffer.alloc(Math.ceil(Math.pow(2, BITS)/8));

function mask(str, bits)
{
    return parseInt(str.slice(-Math.ceil(bits/4)), 16) & ((1 << bits) - 1);
}

fs.readFileSync(path.join(__dirname, '../../data/words-lower.sha256')).toString().split('\n').forEach(function (hash) {
    if (hash) { // skip last line
        let bitIndex = mask(hash, BITS);
        buf[bitIndex >> 3] |= 1 << (bitIndex % 8);
    }
});

fs.writeFileSync(path.join(__dirname, 'a.out'), buf);
