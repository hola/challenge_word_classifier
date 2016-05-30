function hash32(str: string): number {
  const FNV1_32_INIT = 0x811c9dc5;
  const FNV1_PRIME_32 = 16777619;
  var hval = FNV1_32_INIT;
  for (var i = 0; i < str.length; i++) {
    hval ^= str.charCodeAt(i);
    hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
  }
  return hval >>> 0;
}

function strToIdx(s: string): number {
  //aa -> 0, ab -> 1, az -> 25, ba -> 26, bb -> 27, bz -> 51, ca -> 52, ..., aaa -> 676, ...
  var idx = 0;
  var j = 0;
  for (var i = s.length-1; i >= 0; i--) {
    var v = s.charCodeAt(i) - 97;
    idx += Math.pow(26, j) * v;
    j++;
  }
  return idx;
}

var buffer;

function bb(offset: number, byteIdx: number): number {
  return buffer[offset + byteIdx];
}

function isBit(offset: number, bitNum: number): boolean {
  var byteIdx = bitNum >> 3;
  var mask = 1 << (bitNum % 8);
  var b = bb(offset, byteIdx);
  return (b & mask) > 0;
}

var wordsWithQuotes: Set<string> = new Set();
var subdict21Plus: Set<string> = new Set();

const SUBD3 = 16819;

exports.test = function (s: string): boolean {
  const SUBDICT4_DOLLAR_ONLY = 19016;
  const PREFIX3_4_7 = 21195;
  const SUFFIX3_5_7 = 23389;
  const SUFFIX3_8PLUS = 25586;
  const PREFIX4 = 27783;
  const SUBDICT2 = 84821;
  const SUBDICT3_DOLLAR_ONLY = 84906;
  const BLOOM = 84991;

  const BIT_MAX = 429000;

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
    return wordsWithQuotes.has(s);
  }
  if (len == 1) { // a-z OK
    var ch = s.charCodeAt(0);
    return ch >= 97 && ch <= 122;
  }
  if (len == 2 && endsWithDollar) { // a$-z$ OK
    return true;
  }
  if (len == 2) {
    return isBit(SUBDICT2, strToIdx(s));
  }
  if (len == 3 && endsWithDollar) {
    return isBit(SUBDICT3_DOLLAR_ONLY, strToIdx(s.substring(0, len - 1)));
  }
  if (len == 3) {
    return isBit(SUBD3, strToIdx(s));
  }
  if (len == 4 && endsWithDollar) {
    return isBit(SUBDICT4_DOLLAR_ONLY, strToIdx(s.substring(0, len - 1)));
  }
  if (len == 20 && !endsWithDollar) {
    if (subdict21Plus.has(s)) return true;
  }
  if (len >= 21) {
    return subdict21Plus.has(s);
  }

  if (endsWithDollar) len--; // "real" text length
  if (len >= 4 && len <= 7) {
    var pre3 = s.substring(0, 3);
    if (!isBit(PREFIX3_4_7, strToIdx(pre3))) return false;
  }
  if (len >= 8) {
    var pre4 = s.substring(0, 4);
    //console.log(s + "; pre4 = " + strToIdx(pre4));
    if (!isBit(PREFIX4, strToIdx(pre4))) return false;
    //console.log("pre4 ok");
  }
  var suffix = s.substring(len - 3, len);
  //console.log(suffix);
  if (len >= 8 && !isBit(SUFFIX3_8PLUS, strToIdx(suffix))) return false;
  if (len >= 5 && len <= 7 && !isBit(SUFFIX3_5_7, strToIdx(suffix))) return false;

  var h = hash32(s);
  h %= BIT_MAX;
  return isBit(BLOOM, h);
};

exports.init = function (buf) {
  const WORDS_WITH_QUOTES = 13551;
  buffer = buf;
  load(0, WORDS_WITH_QUOTES, subdict21Plus);
  load(WORDS_WITH_QUOTES, SUBD3, wordsWithQuotes);
  //console.log("subdict21Plus: " + subdict21Plus.size);
  //console.log("wordsWithQuotes: " + wordsWithQuotes.size);
};

function load(fr: number, end: number, d: Set<string>) {
  var s: string = "";
  for (var i = fr; i < end; i++) {
    var b = bb(0, i);
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
