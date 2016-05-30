"use strict";

const bits_per_bucket = 8;
const LN2_SQUARED = Math.LN2 * Math.LN2;

function FNV() {
    this.hash = 0x811C9DC5 /* offset_basis */
}

// FNV-1 hash algorithm
FNV.prototype = {
    update: function(data) {
        if (typeof data === 'string') {
            data = Buffer(data)
        } else if (!(data instanceof Buffer)) {
            throw Error("FNV.update expectes String or Buffer")
        }
        for (var i = 0; i < data.length; i++) {
            /* 32 bit FNV_Prime = 2**24 + 2**8 + 0x93 */
            this.hash += (this.hash << 24) + (this.hash << 8) + (this.hash << 7) + (this.hash << 4) + (this.hash << 1)
            this.hash = this.hash ^ data[i]
        }
    },
    value: function() {
        return this.hash & 0xffffffff
    }
}

function calculateSize(capacity, error_rate) {
    return Math.ceil(capacity * Math.log(error_rate) / -LN2_SQUARED)
}

function calculateNumberOfHashes(size, capacity) {
    return Math.ceil((size / capacity) * Math.LN2)
}

function BitBuffer(size, buffer) {

    this.values = new Int8Array(Math.ceil(size / bits_per_bucket));

    if (buffer) {
        this.values = new Int8Array(buffer);
    } else {
        for (var i = 0; i < Math.ceil(size / bits_per_bucket); i += 1) {
            this.values[i] = 0;
        }
    }
}

BitBuffer.prototype = {
    set: function(index, value) {
        var i = Math.floor(index / bits_per_bucket);
        // Since "undefined | 1 << index" is equivalent to "0 | 1 << index" we do not need to initialise the array explicitly here.
        if (value) {
            this.values[i] |= 1 << index - i * bits_per_bucket;
        } else {
            this.values[i] &= ~(1 << index - i * bits_per_bucket);
        }
        return this;
    },
    get: function(index) {
        var i = Math.floor(index / bits_per_bucket);
        return !!(this.values[i] & (1 << index - i * bits_per_bucket));
    },
    toBuffer: function() {
        return Buffer.from(this.values);
    },
    toString: function() {
        var str = "";
        for (var i = 0; i < this.values.length; i += 1) {
            str += " " + this.values[i];
        }
        return str;
    }
}

function calulateHashes(key, size, k) {
    /* See:
     * "Less Hashing, Same Performance: Building a Better Bloom Filter"
     * 2005, Adam Kirsch, Michael Mitzenmacher
     * http://citeseerx.ist.psu.edu/viewdoc/summary?doi=10.1.1.72.2442
     */
    function fnv(seed, data) {
        var h = new FNV()
        h.update(seed)
        h.update(data)
        return h.value() >>> 0
    }
    var h1 = fnv(Buffer("S"), key)
    var h2 = fnv(Buffer("W"), key)
    var hashes = []
    for (var i = 0; i < k; i++) {
        hashes.push((h1 + i * h2) % size)
    }
    return hashes
}

function Bloom(size, k, buffer) {
    this.size = size
    this.k = k
    this.bitfield = new BitBuffer(size, buffer);
}

Bloom.prototype = {
    add: function(key) {
        var hashes = calulateHashes(key, this.size, this.k)
        for (var i = 0; i < hashes.length; i++) {
            this.bitfield.set(hashes[i], true)
        }
    },
    has: function(key) {
        var hashes = calulateHashes(key, this.size, this.k)
        for (var i = 0; i < hashes.length; i++) {
            if (!this.bitfield.get(hashes[i])) return false
        }
        return true
    }
}

exports.Bloom = Bloom
exports.calculateSize = calculateSize
exports.calculateNumberOfHashes = calculateNumberOfHashes