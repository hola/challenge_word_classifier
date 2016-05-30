const zlib = require('zlib');
const fs = require('fs');
const serialize = require('../lib/serialize');
const prefix = require('../lib/prefix-tree');
const wordList = require('fs').readFileSync(`${__dirname}/../raw/words.txt`, 'utf8').split('\n');
const missing3 =  require('fs').readFileSync(`${__dirname}/../raw/missing-3.txt`, 'utf8').split('\n');

const compress = (buffer) => {
    return zlib.gzipSync(buffer, { level: zlib.Z_BEST_COMPRESSION });
};

const createTree = (alphabet, slice) => {
    const regex = new RegExp(`[^${alphabet}]`, 'g');
    const transform = word => word.toLowerCase().replace(regex, '').slice(0, slice);
    const tree = prefix.fromArray(wordList, transform);
    // console.log(tree);
    return serialize.bitmask(tree, alphabet);
};

const createNegativeTree = (file) => {
    const alphabet = `abcdefghijklmnopqrstuvwxyz'`;
    return serialize.bitmask(prefix.fromArray(file), alphabet);
};

const trees = [
    createTree('etaoins', 7),
    createTree('zqxjkvbpygfwm', 7),
    createTree('hrdlc', 7),
    createTree('opnszq', 7),
    createNegativeTree(missing3)
];

console.log(trees.map(tree => tree.length));

const data = [].concat.apply([], trees);
// console.log(data.slice(0, 100).join(', '));
const compressed = compress(new Buffer(data));
fs.writeFileSync(`${__dirname}/../final/data`, compressed);
