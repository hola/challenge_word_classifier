#!/usr/bin/env node

// https://www.npmjs.com/package/bloom.js

var BloomFilter = require('bloom.js');

console.log('estimated false positive for 2^19 bits:', (BloomFilter.estimateFalsePositiveRate(630404, Math.pow(2, 19), 1)*100).toFixed(2) + '%');
console.log('estimated false positive for 2^20 bits:', (BloomFilter.estimateFalsePositiveRate(630404, Math.pow(2, 20), 1)*100).toFixed(2) + '%');
console.log('estimated false positive for 2^21 bits:', (BloomFilter.estimateFalsePositiveRate(630404, Math.pow(2, 21), 1)*100).toFixed(2) + '%');
console.log('estimated false positive for 2^22 bits:', (BloomFilter.estimateFalsePositiveRate(630404, Math.pow(2, 22), 1)*100).toFixed(2) + '%');
console.log('estimated false positive for 2^23 bits:', (BloomFilter.estimateFalsePositiveRate(630404, Math.pow(2, 23), 1)*100).toFixed(2) + '%');
console.log('estimated false positive for 2^24 bits:', (BloomFilter.estimateFalsePositiveRate(630404, Math.pow(2, 24), 1)*100).toFixed(2) + '%');
