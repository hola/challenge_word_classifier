#!/usr/bin/env node

var fs = require('fs'),
    zlib = require('zlib'),
    path = require('path'),
    testfiles = [];

for (let d = path.join(__dirname, '../test'), dir = fs.readdirSync(d), i = 0, end = dir.length; i < end; ++i) {
    if (dir[i].match(/^test.*\.json$/)) {
        let file = path.join(d, dir[i]);
        testfiles.push({
            file: file,
            data: JSON.parse(fs.readFileSync(file))
        });
    }
}

['orig', 'md5', 'md5-test', 'sha1', 'sha1-test', 'sha256', 'sha256-test'].forEach(function (moduleName) {
    check(path.join(__dirname, moduleName));
});

function check(modulePath)
{
    var buf,
        module = require(modulePath),
        datafile = path.join(modulePath, 'a.out'),
        datafilegz = path.join(modulePath, 'a.out.gz'),
        grandTotal = 0,
        grandFailed = 0;

    console.log('[' + path.basename(modulePath) + ']');

    if (typeof module.init === 'function') {
        try {
            buf = fs.readFileSync(datafile);
        }
        catch (exception) {
            try {
                buf = zlib.gunzipSync(fs.readFileSync(datafilegz));
            }
            catch (exception) {
            }
        }
        module.init(buf);
    }

    testfiles.forEach(function (test) {
        var total = 0,
            failed = 0;
        Object.keys(test.data).forEach(function (word) {
            if (module.test(word) !== test.data[word]) {
                failed += 1;
                grandFailed += 1;
            }
            total += 1;
            grandTotal += 1;
        });
        console.log(path.basename(test.file), failed + '/' + total, (failed/total*100).toFixed(0) + '%');
    });

    console.log('grand total', grandFailed + '/' + grandTotal, (grandFailed/grandTotal*100).toFixed(0) + '%');
    console.log();
}
