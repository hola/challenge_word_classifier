(function (exports) {
    exports.init = init;
    exports.test = test;
    exports.BloomFilter = BloomFilter;

    var typedArrays = typeof ArrayBuffer !== "undefined";

    var bloomFilter;

    function init(data) {
        var dataStr = data.toString();
        bloomFilter = BloomFilter.deserialize(dataStr);
    }

    function test(word) {
        return bloomFilter.test(word);
    }

    function BloomFilter(m, k) {

        var n = Math.ceil(m / 32),
            i = -1;
        this.m = m = n * 32;
        this.k = k;

        if (typedArrays) {
            var kbytes = 1 << Math.ceil(Math.log(Math.ceil(Math.log(m) / Math.LN2 / 8)) / Math.LN2),
                array = kbytes === 1 ? Uint8Array : kbytes === 2 ? Uint16Array : Uint32Array,
                kbuffer = new ArrayBuffer(kbytes * k),
                buckets = this.buckets = new Int32Array(n);
            this._locations = new array(kbuffer);
        } else {
            var buckets = this.buckets = [];
            while (++i < n) buckets[i] = 0;
            this._locations = [];
        }
    }

    BloomFilter.createOptimal = function (itemcount, errorRate) {
        var opts = BloomFilter.optimize(itemcount, errorRate);
        return new BloomFilter(opts.bits, opts.hashes);
    };

    var LN2_SQUARED = Math.LN2 * Math.LN2;
    BloomFilter.optimize = function (itemcount, errorRate) {
        errorRate = errorRate || 0.005;
        var bits = Math.round(-1 * itemcount * Math.log(errorRate) / LN2_SQUARED);
        var hashes = Math.round((bits / itemcount) * Math.LN2);
        return {
            bits: bits,
            hashes: hashes
        };
    };

    // See http://willwhim.wpengine.com/2011/09/03/producing-n-hash-functions-by-hashing-only-once/
    BloomFilter.prototype.locations = function (v) {
        var k = this.k,
            m = this.m,
            r = this._locations,
            a = fnv_1a(v),
            b = fnv_1a_b(a),
            x = a % m;
        for (var i = 0; i < k; ++i) {
            r[i] = x < 0 ? (x + m) : x;
            x = (x + b) % m;
        }
        return r;
    };

    BloomFilter.prototype.add = function (v) {
        var l = this.locations(v + ""),
            k = this.k,
            buckets = this.buckets;
        for (var i = 0; i < k; ++i) buckets[Math.floor(l[i] / 32)] |= 1 << (l[i] % 32);
    };

    BloomFilter.prototype.test = function (v) {
        var l = this.locations(v + ""),
            k = this.k,
            buckets = this.buckets;
        for (var i = 0; i < k; ++i) {
            var b = l[i];
            if ((buckets[Math.floor(b / 32)] & (1 << (b % 32))) === 0) {
                return false;
            }
        }
        return true;
    };

    BloomFilter.prototype.serialize = function() {
        return JSON.stringify(this);
    };

    BloomFilter.deserialize = function(str) {
        var data = JSON.parse(str);
        var result = new BloomFilter(data.m, data.k);

        var thisArray = Object.keys(data.buckets).map(function (key) {return data.buckets[key]});
        result.buckets = new Int32Array(thisArray);
        var thisArray = Object.keys(data._locations).map(function (key) {return data._locations[key]});
        result._locations = new Uint8Array(thisArray);

        return result;
    };


    // Estimated cardinality.
    BloomFilter.prototype.size = function () {
        var buckets = this.buckets,
            bits = 0;
        for (var i = 0, n = buckets.length; i < n; ++i) bits += popcnt(buckets[i]);
        return -this.m * Math.log(1 - bits / this.m) / this.k;
    };

    // http://graphics.stanford.edu/~seander/bithacks.html#CountBitsSetParallel
    function popcnt(v) {
        v -= (v >> 1) & 0x55555555;
        v = (v & 0x33333333) + ((v >> 2) & 0x33333333);
        return ((v + (v >> 4) & 0xf0f0f0f) * 0x1010101) >> 24;
    }

    // Fowler/Noll/Vo hashing.
    function fnv_1a(v) {
        var a = 2166136261;
        for (var i = 0, n = v.length; i < n; ++i) {
            var c = v.charCodeAt(i),
                d = c & 0xff00;
            if (d) a = fnv_multiply(a ^ d >> 8);
            a = fnv_multiply(a ^ c & 0xff);
        }
        return fnv_mix(a);
    }

    // a * 16777619 mod 2**32
    function fnv_multiply(a) {
        return a + (a << 1) + (a << 4) + (a << 7) + (a << 8) + (a << 24);
    }

    // One additional iteration of FNV, given a hash.
    function fnv_1a_b(a) {
        return fnv_mix(fnv_multiply(a));
    }

    // See https://web.archive.org/web/20131019013225/http://home.comcast.net/~bretm/hash/6.html
    function fnv_mix(a) {
        a += a << 13;
        a ^= a >>> 7;
        a += a << 3;
        a ^= a >>> 17;
        a += a << 5;
        return a & 0xffffffff;
    }


})(typeof exports !== "undefined" ? exports : this);
