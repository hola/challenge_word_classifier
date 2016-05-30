'use strict';

class Bloom {
  constructor() {
    this.size = 502433;
    this.seeds = [342];
    this.bits = [];
  }

  testBit(i) {
    return (this.bits[Math.floor(i / 32)] >>> (i % 32)) & 1;
  }

  setBit(i) {
    this.bits[Math.floor(i / 32)] |= 1 << (i % 32);
  }

  hash(str, seed) {
    var result = 1;
    for (var i = 0; i < str.length; ++i) {
      result = (seed * result + str.charCodeAt(i)) & 0xFFFFFFFF;
    }
    return Math.abs(result) % this.size;
  }

  add(str) {
    for (let seed of this.seeds) {
      this.setBit(this.hash(str, seed) % this.size);
    }
  }

  test(str) {
    for (let seed of this.seeds) {
      if (!this.testBit(this.hash(str, seed) % this.size)) {
        return false;
      }
    }
    return true;
  }
}

const zlib = require('zlib');
const fs = require('fs');
const expect = require('chai').expect;
const words = fs.readFileSync('stems.txt').toString('utf-8').split('\n');
const bloom = new Bloom();
for (let w of words) {
  bloom.add(w);
}
const buf = new Buffer(bloom.bits.length * 4);
for (let i = 0; i < bloom.bits.length; i++) {
  buf.writeInt32BE(bloom.bits[i], i*4);
}
fs.writeFileSync('bloom.bin.gz', zlib.gzipSync(buf));