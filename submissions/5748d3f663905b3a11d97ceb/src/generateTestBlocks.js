'use strict';

var http = require('http'),
    fs = require('fs'),
    startIndex = process.argv[2] || 1,
    count = process.argv[3] || 10,
    dir   = process.argv[4] || './test_blocks',
    prePath = '/challenges/word_classifier/testcase/',
    timeout = 15,
    httpOptions = {
        protocol: 'http:',
        host: 'hola.org',
        port: '80',
        method: 'GET'
    },
    queue = [];

dir = dir.slice(-1) === '/' ? dir.slice(0, -1) : dir;

try {
    fs.statSync(dir);
} 
catch (err) {
    fs.mkdirSync(dir)
}

function progress() {
    let i = ++progress.i;
    let percent = i / count * 100;
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(`\x1b[34mProgress: ${percent.toFixed(2)} %\x1b[0m`);
}

progress.i = 0;

function saveBlock(data, i) {
    return fs.writeFile(`${dir}/${i}.json`, JSON.stringify(data), (err) => {
        if (err) {
            console.log(`Error saving ${i}`);
        }
    });
}

function gettingBlock(i) {
    httpOptions.path = `${prePath}${i}`;
    
    return new Promise( (resolve, reject) => {
        var req = http.request(httpOptions, function(res) {
            var data = '';

            if (res.statusCode < 200 || res.statusCode > 299) {
                reject(new Error('Failed to load block, status code: ' + res.statusCode));
            }

            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(JSON.parse(data)));
        });

        req.on('error', e => reject(e));

        req.end();
    });
}

let success = 0;
(function run(i) {
    queue.push(gettingBlock(i)
        .then(data => saveBlock(data, i))
        .then(() => progress())
        .then(() => ++success)
        .catch(err => console.log(err))
    );
    
    if (i - startIndex >= count) {
        Promise.all(queue).then(() => {
            console.log('\x1b[32m', '\nFinished: ', success, '\x1b[0m');
        });
        return;
    }
    
    setTimeout(() => run(++i), timeout);
})(startIndex);