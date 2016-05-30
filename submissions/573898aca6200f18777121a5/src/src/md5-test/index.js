var BITS = 19;

var fs = require('fs'),
    path = require('path');
    crypto = require('crypto'),
    hashes = {};

function mask(str, bits)
{
    return parseInt(str.slice(-Math.ceil(bits/4)), 16) & ((1 << bits) - 1);
}

fs.readFileSync(path.join(__dirname, '../../data/words-lower.md5')).toString().split('\n').forEach(function (hash) {
    if (hash) { // skip last line
        hashes[('00000000' + mask(hash, BITS).toString(16)).slice(-Math.ceil(BITS/4))] = true;
    }
});

function test(word)
{
    var bitIndex = mask(crypto.createHash('md5').update(word).digest('hex'), BITS);
    return typeof hashes[('00000000' + bitIndex.toString(16)).slice(-Math.ceil(BITS/4))] !== 'undefined';
}

exports.test = test;
