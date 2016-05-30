'use strict';

let BloomFilter = function(arg) {
    let self = this;
    self.data = new Uint8Array(arg);

    self.contains = word => {
        let pos = self.hash(word);
        let offset = pos % 8;
        let index = Math.floor(pos / 8) % self.data.length;
        return (self.data[index] & (1 << offset)) !== 0;
    };

    self.hash = str => {
        var result = 1;
        for (let ch of str) {
            result = (49 * result + ch.charCodeAt(0)) & 0xFFFFFFFF;
        }
        return Math.abs(result);
    };
};

module.exports = BloomFilter;
