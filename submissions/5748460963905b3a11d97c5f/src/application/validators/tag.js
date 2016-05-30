'use strict';

module.exports = function(options) {
  this.name = options.name;

  this.validate = word => {
    return typeof word === 'string' && word;
  };

  this.format = word => {
    return word.toLowerCase();
  };
};
