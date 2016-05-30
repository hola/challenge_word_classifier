'use strict';

const bloom = require('./bloom');

exports.init = data => {
  bloom.init(511034, 1);
  bloom.import(data.buffer);
};

exports.test = word => {
  return bloom.test(word);
};
