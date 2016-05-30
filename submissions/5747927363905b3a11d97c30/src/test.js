const solution = require('./solution/solution');
const fs = require('fs');
const zlib = require('zlib');
const request = require('request-promise');
const readline = require('readline');
const readByLine = require('./readbyline');

const data = fs.readFileSync('./solution/data.gz');
const buf = zlib.gunzipSync(data);
solution.init(buf);

const perc = (a, b) => `${a * 100/ b }%`;
const outputResult = (sum, total) => console.log(`${sum} / ${total} = ${sum * 100/ total }%`);

const par = process.argv[2];
if (par === 'all') {
    let s = [0, 0], t = [0, 0];
    const tp = readByLine('./words/trues.txt', word => word.length > 0 && ++t[0] && solution.test(word) && ++s[0]);
    readByLine('./words/falses.txt', word => word.length > 0 && ++t[1] && !solution.test(word) && ++s[1])
        .then(tp)
        .then(() => outputResult(s[0] + s[1], t[0] + t[1]))
        .then(() => console.log(s, t));
   
} else if (par === 'some' && process.argv[3] > 0) {
    const n = process.argv[3] / 2;
    const threshold = 20 / n;
    const foo = (word, isTrue) => Math.random() < threshold && !console.log(word, 'should be', isTrue);
    let s = [0, 0], t = [0, 0];
    const tp = readByLine('./words/trues.txt', word => word.length > 0 && ++t[0] && (solution.test(word) && ++s[0] || foo(word, true)), n);
    readByLine('./words/falses.txt', word => word.length > 0 && ++t[1] && (!solution.test(word) && ++s[1] || foo(word, false)), n)
        .then(tp)
        .then(() => outputResult(s[0] + s[1], t[0] + t[1]))
        .then(() => console.log(s, t, perc(s[0], t[0]), perc(s[1], t[1])));    
} else if (par === undefined) {
    console.log('input word & press enter');
    //process.stdout.write('ok\033[0G');
    readline.createInterface({ input: process.stdin })
        .on('line', word => console.log(solution.test(word)));

} else {
    const pages = process.argv.slice(2);
    let nDownloaded = 0;
    const requestN = n => request("https://hola.org/challenges/word_classifier/testcase/" + n);
    const promises = pages.map(requestN).map(p => p.then(body => {
        ++nDownloaded;
        process.stdout.write(`Downloading ${++nDownloaded}"%\r`);
        const sample = JSON.parse(body);
        const words = Object.keys(sample);
        return {
            sum: words.reduce((p, c) => p + (solution.test(c) === sample[c]), 0),
            total: words.length
        };
    }));

    const adder = (arr, prop) => arr.reduce((p, c) => p + c[prop], 0);
    Promise.all(promises)
        .then(res => outputResult(adder(res, 'sum'), adder(res, 'total')));
}