'use strict';

module.exports = function(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
};
