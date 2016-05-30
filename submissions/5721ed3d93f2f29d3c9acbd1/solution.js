'use strict';

const soundex = (str)=>{
    let split = String(str).toUpperCase().replace(/[^A-Z]/g,'').split(''),
        map = {BFPV:1,CGJKQSXZ:2,DT:3,L:4,MN:5,R:6},
        keys = Object.keys(map).reverse();
    let build = split.map(function (letter, index, array) {
        for (let num in keys) {
            if (keys[num].indexOf(letter) != -1) {
               return map[keys[num]];
            };
        };
    });
    let first = build.splice(0,1)[0];
    build = build.filter(function(num, index, array) {
        return ((index===0)?num !== first:num !== array[index-1]);
    });
    let len = build.length;
    let max;
    max = 3;
    return split[0]+(build.join('')+(new Array(max+1).join('0'))).slice(0,max);
};


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
let sdx;

module.exports = {
    init: function(data){
        sdx = (''+data.slice(0, 24484)).match(/.{4}/g);
        data = data.slice(24484);
        let buf = new Buffer(data);
        let count = data.length / 4;
        for(let i = 0; i < count; i++)
            b.raw[i] = buf.readInt32LE(i * 4);
    },
    test: function(word){
        if (word.endsWith("'s"))
            word = word.substr(0, word.length - 2);
        for(let i of getIndexes(word))
        {
            if (!b.test(i))
                return false;
        }
        return sdx.indexOf(soundex(word)) !== -1;
    }
};
