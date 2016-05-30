(exports => {
    'use strict';

    let common = require('./common');
    let BloomFilter = require('./bloom-filter');

    let filter;
    let freq;
    let filterFirst3;
    let regexps;

    exports.init = data => {
        let itemNum = 0;
        let offset = 16;
        let readNextBlock = readAsArrayBuffer => (readAsArrayBuffer ? data : data.buffer)
            .slice(offset, offset += data.readUInt32LE((itemNum++) * 4));
        filter = new BloomFilter(readNextBlock());
        filterFirst3 = new BloomFilter(readNextBlock());
        freq = new Uint8Array(readNextBlock());
        regexps = readNextBlock(true).toString().split('\n').map(line => {
            let parts = line.split('\t');
            return [new RegExp(parts[0]), parts[1] || ''];
        });
    };

    exports.test = word => {
        let heuristics = common.heuristics(word, regexps, freq);
        if (heuristics !== 0) {
            return heuristics;
        }
        let simple = common.simplify(word, regexps);
        return !common.skipFirst(simple, freq, filterFirst3) && filter.contains(simple);
    };
})(module.exports);
