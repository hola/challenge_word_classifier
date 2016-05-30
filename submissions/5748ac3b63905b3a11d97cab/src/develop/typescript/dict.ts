function h(str: string): number {
  let FNV1_32_INIT = 0x811c9dc5;
  let FNV1_PRIME_32 = 16777619;
  var hval = FNV1_32_INIT;
  for (var i = 0; i < str.length; i++) {
    hval ^= str.charCodeAt(i);
    hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
  }
  return hval >>> 0;
}

function i(s: string): number {
  //aa -> 0, ab -> 1, az -> 25, ba -> 26, bb -> 27, bz -> 51, ca -> 52, ..., aaa -> 676, ...
  var idx = 0, j = 0;
  for (var i = s.length-1; i >= 0; i--) {
    var v = s.charCodeAt(i) - 97;
    idx += Math.pow(26, j) * v;
    j++;
  }
  return idx;
}

var u;

function x(offset: number, byteIdx: number): number {
  return u[offset + byteIdx];
}

function y(offset: number, bitNum: number): boolean {
  var byteIdx = bitNum >> 3;
  var mask = 1 << (bitNum % 8);
  var b = x(offset, byteIdx);
  return (b & mask) > 0;
}

var q: Set<string> = new Set();
var o: Set<string> = new Set();

let D3 = 16819;

exports.test = function (s: string): boolean {
  let SUBDICT4_DOLLAR_ONLY = 19016;
  let PREFIX3_4_7 = 21195;
  let SUFFIX3_5_7 = 23389;
  let SUFFIX3_8PLUS = 25586;
  let PREFIX4 = 27783;
  let SUBDICT2 = 84821;
  let SUBDICT3_DOLLAR_ONLY = 84906;
  let BLOOM = 84991;

  let BIT_MAX = 429000;

  //console.log(s);
  var len = s.length;
  var endsWithDollar: boolean;
  if (s.endsWith("\'s")) {
    s = s.substring(0, len - 2) + '$';
    len--;
    endsWithDollar = true;
    //console.log(s + ";" + len);
  } else {
    endsWithDollar = false;
  }
  if (s.indexOf('\'') >= 0) { // quotes dictionary
    return q.has(s);
  }
  if (len == 1) { // a-z OK
    var ch = s.charCodeAt(0);
    return ch >= 97 && ch <= 122;
  }
  if (len == 2 && endsWithDollar) { // a$-z$ OK
    return true;
  }
  if (len == 2) {
    return y(SUBDICT2, i(s));
  }
  if (len == 3 && endsWithDollar) {
    return y(SUBDICT3_DOLLAR_ONLY, i(s.substring(0, len - 1)));
  }
  if (len == 3) {
    return y(D3, i(s));
  }
  if (len == 4 && endsWithDollar) {
    return y(SUBDICT4_DOLLAR_ONLY, i(s.substring(0, len - 1)));
  }
  if (len == 20 && !endsWithDollar) {
    if (o.has(s)) return true;
  }
  if (len >= 21) {
    return o.has(s);
  }

  if (endsWithDollar) len--; // "real" text length
  if (len >= 4 && len <= 7) {
    var pre3 = s.substring(0, 3);
    if (!y(PREFIX3_4_7, i(pre3))) return false;
  }
  if (len >= 8) {
    var pre4 = s.substring(0, 4);
    //console.log(s + "; pre4 = " + strToIdx(pre4));
    if (!y(PREFIX4, i(pre4))) return false;
    //console.log("pre4 ok");
  }
  var suffix = s.substring(len - 3, len);
  //console.log(suffix);
  if (len >= 8 && !y(SUFFIX3_8PLUS, i(suffix))) return false;
  if (len >= 5 && len <= 7 && !y(SUFFIX3_5_7, i(suffix))) return false;

  var hash = h(s);
  hash %= BIT_MAX;
  return y(BLOOM, hash);
};

exports.init = function (buffer) {
  let WORDS_WITH_QUOTES = 13551;
  u = buffer;
  l(0, WORDS_WITH_QUOTES, o);
  l(WORDS_WITH_QUOTES, D3, q);
  //console.log("o: " + o.size);
  //console.log("q: " + q.size);
};

function l(fr: number, end: number, d: Set<string>) {
  var s: string = "";
  for (var i = fr; i < end; i++) {
    var b = x(0, i);
    if (b == 10) {
      d.add(s);
      s = "";
    } else {
      s += b;
    }
  }
  if (s != "") d.add(s);
}


/*function testDict() {
  var s = "goga's";
  for (var i = 0, l = s.length; i < l; i++) {
    console.log(s.charCodeAt(i));
  }
  console.log(s + " = " + hash32(s));
}*/
