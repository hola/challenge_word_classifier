'use strict';

module.exports = function(options) {
  this.name = options.name;
  this.lengthInner = options.lengthInner;
  this.lengthBegin = options.lengthBegin;
  this.lengthEnd = options.lengthEnd;

  // grams alphabet
  this.abc = 'abcdefghijklmnopqrstuvwxyz';

  // grams collections with nonexistent grams in dictionary
  this.inners = null;
  this.begins = null;
  this.ends = null;

  this.getWordInners = word => {
    let start = this.lengthBegin - 1;
    let end = word.length - this.lengthEnd + 1;
    let inner = word.substring(start, end);
    let grams = {};

    let last = inner.length - this.lengthInner;
    for (let i = 0; i <= last; i++) {
      let gram = inner.substring(i, i + this.lengthInner);
      grams[gram] = true;
    }

    return grams;
  };

  this.getWordBegin = word => {
    return word.substring(0, this.lengthBegin);
  };

  this.getWordEnd = word => {
    return word.substring(word.length - this.lengthEnd);
  };

  this.build = dictionary => {
    let inners = {};
    let begins = {};
    let ends = {};

    var _getNonexistentHash = (existed, prefix, length) => {
      let grams = {};
      for (let i in this.abc) {
        let gram = prefix + this.abc[i];
        if (length > 1) {
          Object.assign(grams, _getNonexistentHash(existed, gram, length - 1));
        } else {
          if (!existed[gram]) {
            grams[gram] = true;
          }
        }
      }

      return grams;
    };

    dictionary.forEach(word => {
      let lengthInner = word.length - this.lengthBegin - this.lengthEnd + 3;
      if (lengthInner >= this.lengthInner) {
        Object.assign(inners, this.getWordInners(word));
      }

      if (word.length >= this.lengthBegin) {
        begins[this.getWordBegin(word)] = true;
      }

      if (word.length >= this.lengthEnd) {
        ends[this.getWordEnd(word)] = true;
      }
    });

    this.inners = _getNonexistentHash(inners, '', this.lengthInner);
    this.begins = _getNonexistentHash(begins, '', this.lengthBegin);
    this.ends = _getNonexistentHash(ends, '', this.lengthEnd);
  };

  this.encode = () => {
    let data = [
      this.encodeHash(this.inners),
      this.encodeHash(this.begins),
      this.encodeHash(this.ends)
    ];
    
    return JSON.stringify(data);
  };

  this.encodeHash = hash => {
    return Object.keys(hash).join('');
  };

  this.decode = raw => {
    let data = JSON.parse(raw);
    this.inners = this.decodeHash(data[0], this.lengthInner);
    this.begins = this.decodeHash(data[1], this.lengthBegin);
    this.ends = this.decodeHash(data[2], this.lengthEnd);
  };

  this.decodeHash = (raw, step) => {
    let expression = new RegExp(`.{1,${step}}`, 'g');
    let hash = {};
    raw.match(expression).forEach(item => {
      hash[item] = true;
    });

    return hash;
  };

  this.validate = word => {
    let inners = this.getWordInners(word);
    for (let gram in inners) {
      if (inners.hasOwnProperty(gram) && this.inners.hasOwnProperty(gram)) {
        return false;
      }
    }

    let begin = this.getWordBegin(word);
    if (this.begins.hasOwnProperty(begin)) {
      return false;
    }

    let end = this.getWordEnd(word);
    if (this.ends.hasOwnProperty(end)) {
      return false;
    }

    return true;
  };

  this.format = word => {
    return word;
  };
};
