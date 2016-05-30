/**
 * Created by kriz on 23/05/16.
 */

import fs from 'fs';
import readline from 'readline';
import * as common from './common';

const table = [];
for (let c = 97; c <= 122; c++)
    table[c] = c - 97;
table[39] = 26;
table[NaN] = 27;

const c2828 = 28 * 28;

export function calcThree(three) {
    return table[three.charCodeAt(0)] * c2828
        + table[three.charCodeAt(1)] * 28
        + table[three.charCodeAt(2)];

}

function readLines(fileName, callback, saveCallback) {
    const lineReader = readline.createInterface({
        input: fs.createReadStream(fileName)
    });

    lineReader.on('close', saveCallback);

    lineReader.on('line', callback);
}

//const bytesLength = parseInt((28 * 28 * 28 + 8) / 8);


const bits = new Uint8Array(common.Nbits / 8);

var outFile = './data';
let words = 0;
readLines('./words.txt', line => {
    words++;

    line = line.toLowerCase();
    if (!common.is_apos_ok(line))
        return;

    line = common.norm_word(line);
    const index = common.calc_bitpos(line, common.Nbits);
    const byte = parseInt(index / 8);
    const bit = index % 8;

    bits[byte] = bits[byte] | 1 << bit;
//    console.log(line);
}, () => {
    fs.unlink(outFile);
    fs.appendFile(outFile, new Buffer(bits));
});
