var fs = require('fs');

const solution = require('./solution');

const getBit = (buffer, index) => (buffer[index >>> 3] & (1 << (index % 8))) > 0;
const setBit = (buffer, index, bool) => {
  if (typeof bool !== 'boolean') bool = true;
  const pos = index >>> 3;
  if (bool) {
    buffer[pos] |= 1 << (index % 8);
  } else {
    buffer[pos] &= ~(1 << (index % 8));
  }
};


class BloomFilter {
  constructor(size, khash) {
    const byteSize = Math.ceil(size / 8);
    this.buffer = new Buffer(byteSize);
    this.buffer.fill(0);
    this.hashers = [];
    for (let i = 0; i < khash; i++) {
      this.hashers.push(v => Math.abs(solution.h(i.toString(32) + v) % size));
    }
  }

  add(v) {
    this.hashers.forEach(h => setBit(this.buffer, h(v)));
  }

  has(v) {
    return this.hashers.map(h => getBit(this.buffer, h(v))).indexOf(false) === -1;

  }
};

module.exports = BloomFilter;

if (process.argv.indexOf('test') !== -1) {
  function test(size, hashfucs, words) {
    const b = new BloomFilter(size, hashfucs);
    b.add('Andrey');
    b.add('Kogut');
    if (!b.has('Andrey') || !b.has('Kogut')) {
      throw new Error();
    }
    for (let i = 0; i < words; i++) {
      const v = i.toString() + Math.random().toString(32);
      b.add(v);
    }
    let err = 0;
    const serrs = 10000;
    for (let z = 0; z < serrs; z++) {
      const v = z.toString() + Math.random().toString(32);
      if (b.has(v)) { err++ }
    }
    return err / serrs;
  }
  const iterations = 50;
  console.log(new Array(iterations).fill().reduce(() => test(1000, 3, 100), 0) / iterations + '% errors');
}
