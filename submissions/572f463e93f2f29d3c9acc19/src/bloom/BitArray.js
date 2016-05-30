var appConfig = require("../app.config.js").appConfig;
var BIT_COUNT = 8 * appConfig.INT_SIZE; //in bit

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

module.exports = BitArray;
