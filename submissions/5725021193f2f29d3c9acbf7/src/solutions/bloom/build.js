'use strict';

const fs = require('fs');
const child_process = require('child_process');
const words = require('../../data/words.json');
const bloom = require('./bloom');

bloom.init(511034, 1);

for (const word of words) {
  bloom.add(word);
}

const data = bloom.export();
fs.writeFileSync('./solutions/bloom/data.bin', new Buffer(data.buffer));
child_process.execSync('gzip -9kf ./solutions/bloom/data.bin');

let stats = child_process.execSync('gzip -lv ./solutions/bloom/data.bin.gz');
console.log(stats.toString());
