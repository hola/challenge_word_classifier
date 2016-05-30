'use strict';

const fs = require('fs');
const zlib = require('zlib');

const stat = require('./stat');

let testFolder = 'tests/' + (process.argv.filter(arg => arg.startsWith('--folder=')).map(arg => arg.replace('--folder=', ''))[0] || 's1');
let modPath = process.argv.some(arg => arg.startsWith('--dist')) ? './out/solution.js' : './module.js';

const mod = require(modPath);

if (mod.init) {
    const data = zlib.gunzipSync(fs.readFileSync('out/data.gz'));
    mod.init(data);
}

if (!fs.existsSync(testFolder)) {
    console.error('no folder %s', testFolder);
    process.exit(1);
}

process.stdout.write('testing ' + modPath + ': ' + testFolder);

var matchCount = 0;
var totalTests = 0;
var falsePositives = [];
var falseNegatives = [];
var results = [];

for (let file of fs.readdirSync(testFolder)) {
    if (!/\d+/.test(file)) {
        continue;
    }
    let testData = JSON.parse(fs.readFileSync('./' + testFolder + '/' + file));
    let blockMatchCount = 0;
    for (let word of Object.keys(testData)) {
        let expected = testData[word];
        let actual = mod.test(word);
        totalTests++;
        if (actual === expected) {
            matchCount++;
            blockMatchCount++;
        }
        if (actual && !expected) {
            falsePositives.push(word);
        }
        if (!actual && expected) {
            falseNegatives.push(word);
        }
    }
    results.push(blockMatchCount);
    if (results.length % 1000 === 0) {
        process.stdout.write('.');
    }
}
process.stdout.write('\n');

if (process.argv.some(arg => arg.startsWith('--chart'))) {
    const slidingSampleSize = Math.min(1000, results.length);
    let probs = [], slidingProbs = [];
    let sum = 0, slidingSum = 0;
    for (let ix = results.length - slidingSampleSize; ix < results.length; ix++) {
        slidingSum += results[ix];
    }
    results.forEach((res, ix) => {
        sum += res;
        slidingSum += res - results[ix >= slidingSampleSize ? ix - slidingSampleSize : results.length - slidingSampleSize + ix];
        probs.push(+(sum / (ix + 1)).toFixed(4));
        slidingProbs.push(slidingSum / slidingSampleSize);
    });
    const chartTemplate = fs.readFileSync('chart-templates/prob.html', 'utf8');
    let chartHtml = chartTemplate
        .replace('data_rate', JSON.stringify(results))
        .replace('data_avg', JSON.stringify(probs))
        .replace('data_sl_avg', JSON.stringify(slidingProbs));
    fs.writeFileSync('tmp/chart-prob.html', chartHtml);
}

if (!totalTests) {
    console.error('empty folder %s', testFolder);
    process.exit(1);
}

console.log('done: %d / %d (%d%), fpos: %d, fneg: %d, min: %d, max: %d, stddev: %d',
    matchCount, totalTests, (100 * matchCount / totalTests).toFixed(2),
    falsePositives.length, falseNegatives.length,
    stat.min(results),
    stat.max(results),
    Math.round(stat.stdev(results))
);

if (!fs.existsSync('tmp')) {
    fs.mkdirSync('tmp');
}
if (process.argv.some(arg => arg.startsWith('--print-errors'))) {
    fs.writeFileSync('tmp/false-positives.txt', falsePositives.sort().join('\n'));
    fs.writeFileSync('tmp/false-negatives.txt', falseNegatives.sort().join('\n'));
}
