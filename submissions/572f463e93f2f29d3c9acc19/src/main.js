var bloomFilterConfig = {
    N: 662003,
    P: 0.01,
    // SIZE: 6500000, //calculated by http://hur.st/bloomfilter?n=662003&p=0.01
    // k: 7,
    SIZE: 62*1000*8,
    K: 1,
    INITIAL_SEED: 11,
};

var INT_SIZE = 4;
var HashFunc = hash;
var BIT_COUNT = 8 * INT_SIZE; //in bit

function hash(s){
    var P = 31;
    var MODULO = 1000000009;
    var h = 0;
    for (var i=0;i<s.length;i++)
    {
        var c = s[i].toUpperCase();
        if ("ABCDEFGHIJKLMNOPQRSTUVWXYZ".indexOf(c) === -1) continue;
        h = (h * P + (c.charCodeAt(0) - 'A'.charCodeAt(0))) % MODULO;
    }
    // console.log(s, h);
    return h;
}

function BitArray(size, buckets){
    this.size = Math.ceil(size / BIT_COUNT);
    if (buckets){
        this.buckets = [];
        for (var i=0;i<buckets.length;i++){
            this.buckets[i] = buckets[i];
        }
    }
    else
    {
        this.buckets = [];
        for (var i=0;i<this.size;i++){
            this.buckets[i] = 0;
        }
    }
}

BitArray.prototype = {
    set: function(k){
        var i = Math.floor(k / BIT_COUNT);
        var pos = k % BIT_COUNT;
        var flag = 1 << pos;
        this.buckets[i] = this.buckets[i] | flag;
    },
    test: function(k){
        var i = Math.floor(k / BIT_COUNT);
        var pos = k % BIT_COUNT;
        var flag = 1 << pos;
        return ((this.buckets[i] & flag) === 0) ? false : true;
    },
    get: function(){
        return this.buckets;
    }
}

function BloomFilter(buckets) {
    this.bitArray = new BitArray(bloomFilterConfig.SIZE, buckets);
}

BloomFilter.prototype = {
    add: function (word) {
        var h;
        for (var i = 0; i < bloomFilterConfig.K; i++) {
            h = HashFunc(word, bloomFilterConfig.INITIAL_SEED + i) % bloomFilterConfig.SIZE;
            this.bitArray.set(h);
        }
    },
    get: function (){
        return this.bitArray.get();
    },
    test: function (word) {
        var h;
        for (var i=0;i<bloomFilterConfig.K;i++){
            h = HashFunc(word, bloomFilterConfig.INITIAL_SEED + i) % bloomFilterConfig.SIZE;
            if (this.bitArray.test(h) === false){
                return false;
            }
        }
        return true;
    }
}

var bufferToArray = function (buffer) {
    var arr = [];
    var len = 0;
    while (len < buffer.length) {
        arr.push(buffer.readIntBE(len, INT_SIZE));
        len += INT_SIZE;
    }
    return arr;
}

var bloomFilter;

exports.init = function (buffer) {
    var buckets = bufferToArray(buffer);
    bloomFilter = new BloomFilter(buckets);
}

exports.test = function (word) {
    console.log(word);
    return bloomFilter.test(word);
}
