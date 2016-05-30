'use strict';

const Tree = require('./tree');

module.exports = function(options) {
  this.name = options.name;

  this.trees = options.trees.map(optionsTree => {
    return new Tree({
      forest: this,
      positions: optionsTree.positions,
      validators: optionsTree.validators
    });
  });

  this.build = (dictionary) => {
    this.log('Begin building forest data...');
    this.trees.forEach((tree, index) => {
      this.log(`Build data for tree (${index} of ${this.trees.length})...`);
      tree.build(dictionary);
    });

    return this;
  };

  this.encode = () => {
    let results = this.trees.map(tree => {
      return tree.encode();
    });

    return results.join(';');
  };

  this.decode = data => {
    if (typeof data === 'string') {
      let rows = data.split(';');
      this.trees.forEach((tree, index) => {
        rows[index] && tree.decode(rows[index]);
      });
    }
  };

  this.validate = word => {
    for (let i in this.trees) {
      if (!this.trees[i].validate(word)) {
        return null;
      }
    }

    return true;
  };

  this.format = word => {
    return word;
  };

  this.log = message => {
    console.log(`[forest] ${message}`);
  };
};
