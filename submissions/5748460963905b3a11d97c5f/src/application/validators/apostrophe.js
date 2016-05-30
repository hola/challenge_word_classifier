'use strict';

module.exports = function(options) {
  this.name = options.name;

  this.symbolExpression = /\'/g;
  this.symbolAtTheEndExpression = /\'s$/g;

  this.validate = word => {
    if (this.symbolExpression.test(word)) {
      return this.symbolAtTheEndExpression.test(word);
    } else {
      return true;
    }
  };

  this.format = word => {
    return word.replace(this.symbolAtTheEndExpression, '').replace(this.symbolExpression, '');
  };
};
