'use strict';

module.exports = function(options) {
  this.name = options.name;

  this.vowels = 'aeiou';
  this.consonants = 'bcdfghjklmnpqrstvwxz'; // all except y

  this.vowelsThreshold = options.vowelsThreshold || this.vowels.length;
  this.consonantsThreshold = options.consonantsThreshold || this.consonants.length;

  this.vowelsExpression = new RegExp(`[${this.vowels}]{${this.vowelsThreshold},}`, 'g');
  this.consonantsExpression = new RegExp(`[${this.consonants}]{${this.consonantsThreshold},}`, 'g');

  this.validate = word => {
    return !(this.vowelsExpression.test(word) || this.consonantsExpression.test(word));
  };

  this.format = word => {
    return word;
  };
};
