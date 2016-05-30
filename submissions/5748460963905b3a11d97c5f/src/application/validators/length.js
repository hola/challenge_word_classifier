'use strict';

module.exports = function(options) {
  this.name = options.name;
  this.min = options.min;
  this.max = options.max;

  this.validate = word => {
    return word.length >= this.min && word.length <= this.max;
  };

  this.format = word => {
    return word;
  };
};
