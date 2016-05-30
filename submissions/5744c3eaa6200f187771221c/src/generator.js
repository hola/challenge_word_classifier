'use strict';

const SOLUTION_FILE = './solution.js';
const WORDS_FILE = './words.txt';
const DICT_FILE = './data.dict';
const DICT_FILE_GZ = './data.gz';

const _ = require('lodash');
const fs = require('fs');
const zlib = require('zlib');
const lineReader = require('readline').createInterface({
    input: fs.createReadStream(WORDS_FILE)
});

let parts = {};
let small = [];

lineReader.on('line', line => {
    let word = line.trim().toLowerCase();
    word = word.replace(/'s$/, '');
    if (word.length > 3) {
        let maxIndex = Math.ceil(word.length / 4);
        for (let i = 0, rI = maxIndex; i < maxIndex; i++, rI--) {
            let w = word.substr(4 * i, 4);
            w = (new Array(4 - w.length)).fill('\0').join('') + w;
            let part = parts[w];
            if (undefined === part) {
                part = [];
                parts[w] = part;
            }
            if (i < 4 && -1 === part.indexOf(i)) {
                part.push(i);
            }
            if (rI <= 4 && -1 === part.indexOf(-1 * rI)) {
                part.push(-1 * rI);
            }
        }
    } else if (word.length > 1) {
        small.push((new Array(4 - word.length)).fill(' ').join('') + word);
    }
}).on('close', () => {
    let partValues = _.chain(_.keys(parts)).uniq().filter(word => {
        return parts[word].length > 0;
    }).map(word => {
        let indexes = parts[word].sort((a, b) => a - b);
        let flags = 0;
        for (let i = 0; i < indexes.length; i++) {
            flags |= (1 << (indexes[i] + 4));
        }
        return word + String.fromCharCode(flags | 4); // (flags | 4) For reducing file size
    }).value();

    let smallValues = _.chain(small).uniq().map(word => {
        return word + String.fromCharCode(0);
    }).value();

    let outValues = partValues.concat(smallValues).sort();

    // Buffer
    let buf = Buffer.alloc(2 + 5 * outValues.length);
    buf.writeUInt16BE(outValues.length, 0);
    // Read by columns for better archiving
    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < outValues.length; j++) {
            buf.writeUInt8(outValues[j].charCodeAt(i), 2 + i * outValues.length + j);
        }
    }

    // Write
    let fd = fs.openSync(DICT_FILE, 'w');
    console.log('Size:\t\t' + fs.writeSync(fd, buf, 0, buf.length));
    fs.closeSync(fd);
    let zbuf = zlib.gzipSync(buf, {level: zlib.Z_MAX_LEVEL});
    let zfd = fs.openSync(DICT_FILE_GZ, 'w');
    let compressed = fs.writeSync(zfd, zbuf, 0, zbuf.length);
    console.log('Compressed:\t' + compressed);
    let total = compressed + fs.statSync(SOLUTION_FILE).size;
    console.log('Total:\t\t' + total);
    console.log('Oversize:\t' + (total - 65536));
    fs.closeSync(zfd);
});
