var BitArray = require('./BitArray.js');
// var HashFunc = require('./MurmurHash.js');
var HashFunc = require('./UniversalHash.js');
var bloomFilterConfig = require('../app.config.js').bloomFilterConfig;

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

module.exports = BloomFilter;
