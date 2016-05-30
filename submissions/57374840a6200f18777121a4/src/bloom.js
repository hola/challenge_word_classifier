const b = require('bloomfilter');
const fs = require('fs');
const _ = require('lodash');

process.argv.shift();
process.argv.shift();
const from = parseInt(process.argv.shift());
const to = parseInt(process.argv.shift());
const allocateBitsRatio = parseInt(process.argv.shift());
const numberOfHashFunctions = parseInt(process.argv.shift());

let data = require('./data.json');
const totalLines = 630367;

for (let i = from; i <= to; ++i) {
    const words = _.keys(require(`./words-json/${i}.json`));
    const nowords = _.keys(require(`./no-words-json/${i}.json`));
    let bloom = new b.BloomFilter(Math.ceil((words.length/totalLines * 65536) * allocateBitsRatio), numberOfHashFunctions);

    words.forEach(e => bloom.a(e));

    let ratio = nowords.filter(e => !bloom.t(e)).length / nowords.length * 100;

    console.log(`${i}: ${ratio}%`);

    data[1][i] = [numberOfHashFunctions, [].slice.call(bloom.b)];
}

fs.writeFileSync('./data.json', JSON.stringify(data));










