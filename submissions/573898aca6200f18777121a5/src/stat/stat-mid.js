#!/usr/bin/env node

var fs = require('fs');

fs.readFile('data/words.txt', function (err, buffer) {

    var s = '';

    if (err) {
        console.error(err);
        process.exit(1);
    }

    for (let i = 0, end = buffer.length; i < end; ++i) {
        var ch = String.fromCharCode(buffer[i]);
        if (ch == '\n') {
            line(s);
            s = '';
        }
        else {
            s += ch;
        }
    }

    if (s) {
        line(s);
    }

    done();

});

var stat = {};

function line(s)
{
    var n = 6,
        m = 1;

    if (s.length > m+m) {
        for (let i = m, end = s.length - m - n; i < end; ++i) {
            let seq = s.slice(i, i + n);
            if (typeof stat[seq] === 'undefined') {
                stat[seq] = 0;
            }
            stat[seq] += 1;
        }
    }
}

function done()
{
    for (let key in stat) {
        console.log(key, '\t', stat[key]);
    }
}
