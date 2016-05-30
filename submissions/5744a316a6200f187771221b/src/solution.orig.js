"use strict";

var matrix = {};
var prefixes = [];
var bloom = {};
const BF_SIZE = 315171;
const BF_NUM_HASHES = 5;

const NUM_CHARS = 'z'.charCodeAt(0) - 'a'.charCodeAt(0) + 4;

function indexOfChar(c) {
    switch (c) {
        case '^':
            return 0;
        case '\'':
            return NUM_CHARS - 2;
        case '$':
            return NUM_CHARS - 1;
        default:
            return c.charCodeAt(0) - 'a'.charCodeAt(0) + 1;
    }
}

function isDigit(ch) {
    return ch >= '0' && ch <= '9';
}

exports.init = function(buf) {
    let ccnt = 0, prefix = '', prev = '', i = 0;
    for (; i < buf.length; ++i) {
        const ch = String.fromCharCode(buf[i]);
        if (ch === '\n') {
            ++i;
            break;
        }
        if (isDigit(ch)) {
            ccnt += parseInt(ch, 10);
            prefix += prev.substr(0, ccnt);
        }
        else {
            prefix += ch;
            ++ccnt;
        }
        if (ccnt === 3) {
            prefixes.push(prefix);
            prev = prefix;
            prefix = '';
            ccnt = 0;
        }
    }
    for (let j = 0; j < prefixes.length && i < buf.length; ++j, i += 4) {
        matrix[prefixes[j]] = buf.readUInt32LE(i);
    }
    bloom = buf.slice(i);
}

function umul(a, b) {
    return ((((a & 0xffff) * b) + ((((a >>> 16) * b) & 0xffff) << 16))) & 0xffffffff;
}

function uadd(a, b) {
    return (((a & 0xffff) + (b & 0xffff)) + ((((a >>> 16) + (b >>> 16)) & 0xffff) << 16));
}

function u(a) {
    return (a & 0xffff) + (((a >>> 16) & 0xffff) * Math.pow(2, 16));
}

/// thanks to github.com/garycourt/murmurhash-js
function murmurhash3_32_gc(key, seed) {
    var remainder, bytes, h1, h1b, c1, c1b, c2, c2b, k1, i;
   
    remainder = key.length & 3; // key.length % 4
    bytes = key.length - remainder;
    h1 = seed;
    c1 = 0xcc9e2d51;
    c2 = 0x1b873593;
    i = 0;
    
    while (i < bytes) {
        k1 = 
	  	  ((key.charCodeAt(i) & 0xff)) |
	  	  ((key.charCodeAt(++i) & 0xff) << 8) |
	  	  ((key.charCodeAt(++i) & 0xff) << 16) |
	  	  ((key.charCodeAt(++i) & 0xff) << 24);
        ++i;
        
        k1 = umul(k1, c1);
        k1 = (k1 << 15) | (k1 >>> 17);
        k1 = umul(k1, c2);
        
        h1 ^= k1;
        h1 = (h1 << 13) | (h1 >>> 19);
        h1 = uadd(umul(h1, 5), 0xe6546b64);
    }
    
    k1 = 0;
    
    switch (remainder) {
        case 3: k1 ^= (key.charCodeAt(i + 2) & 0xff) << 16;
        case 2: k1 ^= (key.charCodeAt(i + 1) & 0xff) << 8;
        case 1: k1 ^= (key.charCodeAt(i) & 0xff);            
            k1 = umul(k1, c1);
            k1 = (k1 << 15) | (k1 >>> 17);
            k1 = umul(k1, c2);
            h1 ^= k1;
    }
    
    h1 ^= key.length;
    
    h1 ^= h1 >>> 16;
    h1 = umul(h1, 0x85ebca6b);
    h1 ^= h1 >>> 13;
    h1 = umul(h1, 0xc2b2ae35);
    h1 ^= h1 >>> 16;
    
    return h1 >>> 0;
}

function Hash(key) {
    let hashValue = [];
    hashValue.push(murmurhash3_32_gc(key, 0));
    hashValue.push(murmurhash3_32_gc(key, 42));   
    return hashValue;
}

function nthHash(n, hashA, hashB, filterSize) {
    const h =  u(uadd(hashA, umul(n, hashB)));
    return h % filterSize;
}

function getBit(buf, i) {
    let nbyte = i >> 3;
    let mask = (1 << (i & 7));
    let byte = buf[nbyte];
    return (byte & mask) != 0;
}

function checkWithBloom(key) {
    const hashValues = Hash(key);
    for (let n = 0; n < BF_NUM_HASHES; n++) {
        const nbit = nthHash(n, hashValues[0], hashValues[1], BF_SIZE);
        if (!getBit(bloom, nbit)) {
            return false;
        }
    }   
    return true;
}

function getCharWeight(prefix, c) {
    const mask = (1 << indexOfChar(c) - 1);
    let bits = matrix[prefix];
    if (!bits) {
        return 0;
    }
    return (bits & mask) ? 1 : 0;
}

function getWordWeight(word) {
    let pfx = '^' + word[0] + word[1];
    for (let i = 2; i < word.length; ++i) {
        if (!getCharWeight(pfx, word[i])) {
            return 0;
        }
        pfx = pfx.substr(1) + word[i];
    }
    return getCharWeight(pfx, '$');
}

exports.test = function(word) {
    if (word.length === 1) {
        return word[0] >= 'a' && word[0] <= 'z';
    }
    let cnt = 0;
    for (let i = 0; i < word.length; ++i) {
        if (word[i] === "'") {
            ++cnt;
        }
    }
    const strangers = ["bo's'n's", "fo'c's'le", "fo'c's'le's", "fo'c's'les", "fo'c'sle's", "ha'p'orth's"];
    if (cnt >= 3) {
        return strangers.indexOf(word) >= 0;
    }
    return (getWordWeight(word) > 0) || checkWithBloom(word);
}
