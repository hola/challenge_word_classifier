var BUCKETS_COUNT = 32000;
var FINGERPRINT = 0xFFFF;
var FINGERPRINT_BITS = 16;

var fg = new Uint16Array(BUCKETS_COUNT);

function hash(s) {
    var h = 0x811c9dc5;
    
    for (var i = 0; i < s.length; ++i) {
        h ^= s.charCodeAt(i);
        h = (h * 0x01000193);//& 0x7FFFFFFF;
    }
    
    var h1 = h ^ s.length;
    
    h1 ^= h1 >>> 16;
    h1 = (((h1 & 0xffff) * 0x85ebca6b) + ((((h1 >>> 16) * 0x85ebca6b) & 0xffff) << 16)) & 0xffffffff;
    h1 ^= h1 >>> 13;
    h1 = ((((h1 & 0xffff) * 0xc2b2ae35) + ((((h1 >>> 16) * 0xc2b2ae35) & 0xffff) << 16))) & 0xffffffff;
    h1 ^= h1 >>> 16;
    
    h = (h1 >>> 0) % (BUCKETS_COUNT * (FINGERPRINT + 1));
    
    var res = {};
    res.b = (h >>> FINGERPRINT_BITS);
    res.h = (h & FINGERPRINT);
    
    return res;
}   

function init(buff) {
    var data_8 = new Uint8Array(buff);
    fg = new Uint16Array(data_8.buffer);
}

function dp(x, y) {
    for (var i = 1, k=0; i < FINGERPRINT; i <<= 1) {
        if ((x & i) && (y & i)) {
            k ^= 1;
        }
    }
    return k;
}

function test(w) {
    w = w.replace(/'s$/, '')
    s = w.replace(/[cgpst]h/g, 't').replace(/ck|qu|ll|ss|tt/g, 'k');
    
    if ((s.length >= 16) || /[^aeiouy]{4,}|[q']|[^aeiouy]x|j[^aeiouy]|[bdfghjklpsvwx]z/.test(s)) {
        return false;
    }
    
    var b = hash(w);
    
    return dp(fg[b.b], b.h);
}

module.exports.test = test;
module.exports.init = init;