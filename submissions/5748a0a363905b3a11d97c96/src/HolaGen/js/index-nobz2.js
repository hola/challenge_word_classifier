var BloomFilter = (function () {
    // Creates a new bloom filter.  If *m* is an array-like object, with a length
    // property, then the bloom filter is loaded with data from the array, where
    // each element is a 32-bit integer.  Otherwise, *m* should specify the
    // number of bits.  Note that *m* is rounded up to the nearest multiple of
    // 32.  *k* specifies the number of hashing functions.
    function BloomFilter(a, k) {
        var m = a.length * 32;

        var n = Math.ceil(m / 32),
            i = -1;
        this.m = m = n * 32;
        this.k = k;

        var buckets = this.buckets = [];
        while (++i < n) buckets[i] = a[i];
        this._locations = [];
    }

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

    BloomFilter.prototype.test = function (v) {
        var l = this.locations(v),
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

    return BloomFilter;
})();

(function (exports, buffer, dataSize, binSize, readInt32LE) {
    var sampleSize = 2;
    var rejectedSamples = {};
    var bloom = null;

    function splitSamples(word) {
        var samples = [];
        if (word.slice(-2) == '\'s') word = word.slice(0, -2);
        if (word.length < sampleSize) return [];
        word = '`' + word + '`';
        for (var index = 0; index < word.length - sampleSize + 1; index++) {
            samples.push(word.substr(index, sampleSize));
        }
        return samples;
    };

    function preExclude(word) {
        var samples = [];
        if (word.slice(-2) == '\'s') word = word.slice(0, -2);
        if (word.indexOf('\'') != -1) return true;
        if (word.length == 0) return true;
        return false;
    }

    var initTxt = function (data) {
        var contents = data.toString(); // 'ascii'
        var lines = contents.split('\n');
        var line = null;
        var prevLine = '';

        for (var i = 0; i < lines.length; i++) {
            line = lines[i];
            if (line.length == 0) continue
            var sample = prevLine.substr(0, sampleSize - line.length) + line;
            rejectedSamples[sample] = null;
            prevLine = sample;
        }
    };

    var initBin = function (data) {
        var array = [];
        for (var i = 0; i < data.length / 4; i++) {
            array[i] = readInt32LE.call(data, i * 4);
        }
        bloom = new BloomFilter(array, 2);
    };

    initBin(buffer.slice(0, binSize))
    initTxt(buffer.slice(binSize, binSize + dataSize));

    exports.test = function (word) {
        var samples = splitSamples(word);
        var sample = null;

        if (preExclude(word)) return false;

        for (var i = 0; i < samples.length; i++) {
            if (samples[i] in rejectedSamples) return false;
        }

        if (!bloom.test(word.substr(0, 6))) return false;

        return true;
    };
})(exports, b, $DATATXT_SIZE$, $DATABIN_SIZE$, b.readInt32LE);