'use strict';

const BloomFilter = require('./bloom-filter');

BloomFilter.prototype.upgradeToCountingFilter = function() {
    this.posCounts = new Uint32Array(this.data.length * 8);
    this.negCounts = new Uint32Array(this.data.length * 8);
};

BloomFilter.prototype.add = function(word) {
    let pos = this.hash(word);
    let offset = pos % 8;
    let index = Math.floor(pos / 8) % this.data.length;
    this.data[index] |= (1 << offset);
    if (this.posCounts) {
        this.posCounts[index * 8 + offset]++;
    }
};

BloomFilter.prototype.addNeg = function(word) {
    if (!this.negCounts) {
        throw 'Must be counting bloom filter';
    }
    let pos = this.hash(word);
    let offset = pos % 8;
    let index = Math.floor(pos / 8) % this.data.length;
    this.negCounts[index * 8 + offset]++;
};

BloomFilter.prototype.removeNeg = function(negMul, negAdd, negCounts) {
    if (!this.negCounts) {
        throw 'Must be counting bloom filter';
    }
    var replaced = 0;
    for (let pos = 0; pos < this.posCounts.length; pos++) {
        if (this.posCounts[pos] > 0 &&
            this.posCounts[pos] <= negCounts.length &&
            this.negCounts[pos] > negCounts[this.posCounts[pos] - 1] ||

            this.posCounts[pos] > negCounts.length &&
            this.posCounts[pos] < this.negCounts[pos] * negMul + negAdd) {

            let offset = pos % 8;
            let index = Math.floor(pos / 8) % this.data.length;
            this.data[index] &= ~(1 << offset);
            replaced++;
        }
    }
    console.log('removed bloom filter bits: %d', replaced);
};

BloomFilter.prototype.export = function() {
    return this.data.buffer;
};

module.exports = BloomFilter;
