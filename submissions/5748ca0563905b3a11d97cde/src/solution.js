'use strict';

// abcdefghijklmnopqrstuvwxyz

function checkLength(l) {
  return l < 26;
}

function checkOneSymbol(w) {
  return w.charAt(0) !== '\'';
}

class Hola {
  constructor() {
    this.dict = null;
  }

  init(src) {
    var d = src.toString().split('\n').map(v => v.split(' '));
    this.checks = {
      t1: new RegExp(`^(${d[0].join('|')})\$`),
      m1: new RegExp('[b-df-hj-np-tv-xz]{6,}'),
      m2: new RegExp('[aeiouy]{6,}'),
      m3: new RegExp(`^([aeiouy].*){12,}$`),
      m4: new RegExp(`^([b-df-hj-np-tv-xz].*){17,}$`),
      m5: /'$/,
      m6: /'[^stadinmyl]$/,
      m7: /'[jqxz][\w]+/,
      m8: /\w{2,}[bjkpqxz]'\w{2,}/,
      m9: /(a{3,}|b{3,}|c{3,}|d{3,}|e{3,}|f{3,}|g{3,}|h{3,}|i{3,}|j{2,}|k{3,}|l{3,}|m{3,}|n{3,}|o{3,}|p{3,}|q{2,}|r{3,}|s{3,}|t{3,}|u{3,}|v{3,}|w{3,}|x{2,}|y{2,}|z{3,})/,
      p2: new RegExp(`(${d[1].join('|')})`),
      ctm1: d[2] ? new RegExp(`${d[2].join('|')}`) : null,
      ctm2: d[3] ? new RegExp(`^(${d[3].join('|')})\$`) : null
    };
  }

  test(word) {
    var w = word.toLowerCase();
    var l = w.length;

    if (this.checks.t1.test(w)) {
      return true;
    }

    if (!checkOneSymbol(w)) {
      return false;
    }

    if (!checkLength(l)) {
      return false;
    }

    if (l > 7 && this.checks.m1.test(w)) {
      return false;
    }

    if (l > 6 && this.checks.m2.test(w)) {
      return false;
    }

    if (l > 11 && this.checks.m3.test(w)) {
      return false;
    }

    if (l > 16 && this.checks.m4.test(w)) {
      return false;
    }

    if (l > 1 && this.checks.m5.test(w)) {
      return false;
    }

    if (l > 1 && this.checks.m6.test(w)) {
      return false;
    }

    if (l > 1 && this.checks.m7.test(w)) {
      return false;
    }

    if (l > 6 && this.checks.m8.test(w)) {
      return false;
    }

    if (this.checks.m9.test(w)) {
      return false;
    }

    if (l > 1 && this.checks.p2.test(w)) {
      return false;
    }

    if (this.checks.ctm1 && this.checks.ctm1.test(w)) {
      return false;
    }

    if (this.checks.ctm2 && this.checks.ctm2.test(w)) {
      return false;
    }

    return true;
  }
}

module.exports = new Hola();