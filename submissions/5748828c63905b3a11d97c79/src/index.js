var s = (str, by) => str.match(new RegExp(`.${by}`, 'g'));

var oneCharWordTest = (word) => word.length == 1 ? !!word.indexOf("'") : null;
var twoCharWordTest = (word, opt) => word.length == 2 ? !/'/.test(word) && !opt.includes(word) : null;
var longWordTest = (word, opt) => word.length > 22 ? opt.includes(word) : null;
var wordWithApostrophe = (word, opt) => {
  let reg = new RegExp(opt.affixes.join('|'), 'gi');
  return /'/.test(word) ? opt.words.includes(word) ? true : reg.test(word) ? null : false : null;
};
var nCharWord = (n, word, opt) => word.length == n ? opt.includes(word) : null;

var syntax = (word, roots, prefixes, suffixes) => {
  let prefix = null, suffix = [], foundAffix = false, root = null, oWord = word;

  let found = true;
  while (found) {
    found = false;

    for (let i = 0; i < prefixes.length; i++) {
      let index = word.indexOf(prefixes[i]);
      if (index == 0) {
        prefix = prefixes[i];
        word = word.substr(prefixes[i].length);
        found = true;
        foundAffix = true;
        break;
      }
    }
  }

  found = true;
  while (found) {
    found = false;

    for (let i = 0; i < suffixes.length; i++) {
      let index = word.indexOf(suffixes[i]);
      if (index == word.length - suffixes[i].length && index > -1) {
        suffix.push(suffixes[i]);
        word = word.substr(0, word.length - suffixes[i].length);
        found = true;
        foundAffix = true;
        break;
      }
    }
  }

  for (let i = 0; i < roots.length; i++) {
    let index = word.indexOf(roots[i]);
    if (index > -1) {
      root = roots[i];
      word = word.substr(index, roots[i].length);
      break;
    }
  }
  let res, fromOrigin;
  fromOrigin = word.length / (oWord.length / 100);
  if (oWord.length <= 7) {
    res = !!(prefix || suffix.length || root);
  } else if (oWord.length >= 13 ) {
    res =  fromOrigin < 39
  } else {
    let s = prefix && prefix.length <= 2 ? 10 : 0 ;
    res = fromOrigin + s < 80;
  }

  return res;
};

var preprocess = (word) => word.match(/(.*)'s$/i);
var unzip  = (str, f1, f2) => {
  let variants = str.split(',');
  let words = [];
  variants.forEach((vari) => {
    let arr = vari.split(':');
    let starts = s(arr[0], f1) || [];
    let ends = s(arr[1], f2) || [];
    starts.forEach((st) => {
      ends.forEach((en) => {
        words.push(st+en);
      });
    });
  });
  return words;
};

var mod = {
  options: null,

  tests:[
    { test: oneCharWordTest },
    { test: twoCharWordTest, opt: s(this.options.a, 2) },
    { test: longWordTest, opt: this.options.b.split(',') },
    { test: wordWithApostrophe, opt: this.options.c },
    { test: nCharWord.bind(null, 3), opt: unzip(this.options.d, 1, 2) },
    { test: nCharWord.bind(null, 4), opt: unzip(this.options.e, 2, 2) }
  ],

  init: (file) => this.options = JSON.parse(file.toString()),
  test: (word) => {
    var matched;

    matched = preprocess(word);
    if (matched) word = matched[1];


    for (var i = 0; i < this.tests.length; i++) {
      const checker = this.tests[i];
      const res = checker.test(word, checker.opt);

      if (res === true || res === false) return res;
    }
    
    var roots = this.options.f.split(',');
    var prefixes = this.options.g.split(',');
    var suffixes = this.options.h.split(',');
    return syntax(word, roots, prefixes, suffixes);
  }
};

module.exports = mod;
