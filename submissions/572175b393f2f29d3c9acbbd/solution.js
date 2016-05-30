'use strict';
const N = 364442;

function hash(v) {
  const h = string_hash(v);
  return h % N;
}

function string_hash(str) {
  let hash = 5381;
  let i    = str.length;
  while(i) {
    hash = (hash * 33) ^ str.charCodeAt(--i);
  }
  return hash >>> 0;
}

function bitreader(buf) {
  let offset = 0;
  let acc    = 0;
  let n      = 0;
  return function() {
    n -= 1;
    if (n < 0) {
      if (offset >= buf.length) throw new Error("UEB");
      acc = (acc << 8) | buf[offset++];
      n += 8;
    }
    const v = acc >>> n;
    acc &= (1 << n) - 1;
    return v;
  }
}

function decoder(buf) {
  const reader = bitreader(buf);
  return function() {
    while(1) {
      let v = 0;
      while (reader()) {
        v += 1;
      }
      return v;
    }
  }
}

function decodeAll(buf) {
  const d = decoder(buf);
  let n   = 0;
  let arr = [];
  while(1) {
    try {
      n += d();
      arr.push(n);
    } catch(err) {
      break;
    }
  }
  return arr;
}

let HASHS;
module.exports = {
  init: function(buf) {
      HASHS = decodeAll(buf);
  },
  test: w => HASHS.indexOf(hash(w.toLowerCase())) !== -1
}
