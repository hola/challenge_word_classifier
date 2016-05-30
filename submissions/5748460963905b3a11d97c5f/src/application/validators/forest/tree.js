'use strict';

module.exports = function(options) {
  this.forest = options.forest;
  this.positions = options.positions;


  this.build = (dictionary) => {
    this.reset();
    dictionary.forEach(word => {
      if (word) {
        let letters = this.getWordLetters(word, this.positions);
        letters.length && this.pushWord(letters);
      }
    });

    return this;
  };

  this.reset = () => {
    this.root = {};
  };

  this.sort = () => {
    this.root = this.sortRecursion(this.root);
  };

  this.sortRecursion = node => {
    let result = {};

    let keys = [];
    for (let key in node) {
      if (node.hasOwnProperty(key)) {
        keys.push(key);
      }
    }

    keys.sort();
    for (let i = 0; i < keys.length; i++) {
      let key = keys[i];
      result[key] = this.sortRecursion(node[key]);
    }

    node = null;
    return result;
  };

  this.validate = word => {
    if (word) {
      let letters = this.getWordLetters(word, this.positions);
      return this.validateRecursion(this.root, letters);
    } else {
      return false;
    }
  };

  this.validateRecursion = (node, letters) => {
    let letter = letters.shift();
    if (letter in node) {
      if (node[letter] === true) {
        return true;
      } else {
        return this.validateRecursion(node[letter], letters);
      }
    }

    return false;
  };


  this.pushWord = letters => {
    this.pushWordRecursion(this.root, letters);
  };

  this.pushWordRecursion = (node, letters) => {
    let letter = letters.shift();
    !node[letter] && (node[letter] = {});
    letters.length && this.pushWordRecursion(node[letter], letters);
  };

  this.getWordLetters = (word, positions) => {
    let letters = [];
    positions.forEach(position => {
      word[position] && (letters.push(word[position]));
    });

    return letters;
  };


  this.encode = () => {
    this.sort();
    return this.encodeRecursion(this.root);
  };

  this.encodeRecursion = (node) => {
    let result = '';
    for (let letter in node) {
      let letterNode = node[letter];
      if (Object.keys(letterNode).length === 0) {
        result += letter;
      } else {
        // encode next level letters
        let letterResult = this.encodeRecursion(letterNode);

        // process last level letters
        if (letterResult.match(/^\w+$/)) {
          letterResult = letterResult.split('').sort().join('');
        }

        // compile letter data
        result += `[${letter}${letterResult}]`;
      }
    }

    return result;
  };

  this.decode = raw => {
    if (typeof raw === 'string') {
      // prepare encoded data
      let blocks, cache = [];
      let expression = /\[[^\[\]]+\]/g;
      while (blocks = raw.match(expression)) {
        blocks.forEach(item => {
          cache.push(item);
          raw = raw.replace(item, `{${cache.length - 1}}`);
        });
      }

      // build tree based on encoded data
      this.reset();
      this.root = this.decodeRecursion(raw, cache);
    }
  };

  this.decodeRecursion = (raw, cache) => {
    let indexExpression = /\{(\d+)\}/;
    let itemsExpression = /(\{\d+\}|\w)/g;
    let letterExpression = /^\w$/;

    let node = {};
    let items;
    items = raw.match(itemsExpression);
    items.forEach(item => {
      if (letterExpression.test(item)) {
        node[item] = true;
      } else {
        let index = parseInt(item.replace(indexExpression, '$1'));
        index = parseInt(index);
        let value = cache[index];
        let parts = value.match(/^\[(\w)(.*?)\]$/, '$1');
        let letter = parts[1];
        let letterData = parts[2];
        node[letter] = this.decodeRecursion(letterData, cache);
      }
    });

    return node;
  };
};
