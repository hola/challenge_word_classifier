'use strict';
const fs = require('fs');
const soundex = require('soundex');
const data = fs.readFileSync('words.txt', {encoding: 'utf8'});

let words = data.split('\n');

function Bits(){
    var bits = [];
    function test(index){
        return (bits[Math.floor(index / 32)] >>> (index % 32)) & 1;
    }
    function set(index){
        bits[Math.floor(index / 32)] |= 1 << (index % 32);
    }
    return {test: test, set: set, raw: bits};
}
function doHash(str, seed) {
  var m = 0x5bd1e995;
  var r = 24;
  var h = seed ^ str.length;
  var length = str.length;
  var currentIndex = 0;
  while (length >= 4) {
    var k = UInt32(str, currentIndex);
    k = Umul32(k, m);
    k ^= k >>> r;
    k = Umul32(k, m);

    h = Umul32(h, m);
    h ^= k;

    currentIndex += 4;
    length -= 4;
  }
  switch (length) {
  case 3:
    h ^= UInt16(str, currentIndex);
    h ^= str.charCodeAt(currentIndex + 2) << 16;
    h = Umul32(h, m);
    break;
  case 2:
    h ^= UInt16(str, currentIndex);
    h = Umul32(h, m);
    break;
  case 1:
    h ^= str.charCodeAt(currentIndex);
    h = Umul32(h, m);
    break;
  }

  h ^= h >>> 13;
  h = Umul32(h, m);
  h ^= h >>> 15;

  return h >>> 0;
}

function UInt32(str, pos) {
  return (str.charCodeAt(pos++)) +
         (str.charCodeAt(pos++) << 8) +
         (str.charCodeAt(pos++) << 16) +
         (str.charCodeAt(pos) << 24);
}

function UInt16(str, pos) {
  return (str.charCodeAt(pos++)) +
         (str.charCodeAt(pos++) << 8);
}

function Umul32(n, m) {
  n = n | 0;
  m = m | 0;
  var nlo = n & 0xffff;
  var nhi = n >>> 16;
  var res = ((nlo * m) + (((nhi * m) & 0xffff) << 16)) | 0;
  return res;
}

function getFunctions(buckets) {
    var seeds = [802092058];
    return function*(){
        for(;;)
        {
            for(let i = 0; i < seeds.length; i++)
            {
                yield function(str){
                    return doHash(str, seeds[i]) % buckets;
                };
            }
        }
    };
}

let funcs = getFunctions(425728)();
function* getIndexes(word){
    for(let i=0; i<1; i++)
        yield funcs.next().value(word);
}

let b = Bits();
let sdx_obj = {};
words.forEach(w=>{
    if (w.endsWith("'s"))
        return;
    sdx_obj[soundex(w)] = 0;
    for(let i of getIndexes(w))
       b.set( i );
});

let buf = Buffer.allocUnsafe(b.raw.length * 4);
for(let i = 0; i < b.raw.length; i++){
    buf.writeInt32LE(+b.raw[i], i * 4);
}
fs.writeFileSync('words.blum', buf);
fs.writeFileSync('words.sdx', Object.keys(sdx_obj).join(''));
