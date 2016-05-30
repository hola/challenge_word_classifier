'use strict';

const https = require('https');
const fs = require('fs');

const folder = 'tests/new';
const useRandom = true;
const seed = 1000;
const parallelDownloads = 3;

const maxCount = 10000;

let reqLeft = maxCount - fs.readdirSync(folder).length;

function download() {
    var id = useRandom ? Math.round(Math.random() * 2000000000) : reqLeft + seed;
    https.get('https://hola.org/challenges/word_classifier/testcase/' + id, res => {
        if (res.statusCode !== 200) {
            console.error('status code ', res.statusCode);
        } else {
            res.setEncoding('utf8');
            var data = '';
            res.on('data', function (chunk) {
                data += chunk;
            });
            res.on('end', function () {
                fs.writeFileSync('./' + folder + '/' + id, data, 'utf-8');
                reqLeft--;
                console.log(reqLeft);
                if (reqLeft > 0) {
                    setTimeout(download, 100);
                }
            });
        }
    });
}

for (let i = 0; i < parallelDownloads; i++) {
    download();
}
