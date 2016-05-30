function Bloom(size, countHashes) {
    this.size = size;
    this.bits =  new Uint8Array(Math.ceil(size / 8));
    this.countHashes = countHashes;
}

fnv_multiply = (a) => {
    return a + (a << 1) + (a << 4) + (a << 7) + (a << 8) + (a << 24);
};

fnv_mix = (a) => {
    a += a << 13;
    a ^= a >>> 7;
    a += a << 3;
    a ^= a >>> 17;
    a += a << 5;
    return a & 0xffffffff;
};

fnv_1a_b = (a) => {
    return fnv_mix(fnv_multiply(a));
};

fnv_1a = (str) => {
    var offset = 2166136261,
        strLen = str.length,
        i, char, dChar;
    
    for (i = 0; i < strLen; ++i) {
        char = str.charCodeAt(i);
        dChar = char & 0xff00;
        
        if (dChar) {
            offset = fnv_multiply(offset ^ dChar >> 8);
        }
        
        offset = fnv_multiply(offset ^ char & 0xff);
    }

    return fnv_mix(offset);
};

// See http://willwhim.wpengine.com/2011/09/03/producing-n-hash-functions-by-hashing-only-once/
Bloom.prototype.getIndices = function (v) {
    var ch = this.countHashes,
        size = this.size,
        indices = new Uint32Array(new ArrayBuffer(4 * ch)),
        hash1 = fnv_1a(v),
        hash2 = fnv_1a_b(hash1),
        x = hash1 % size,
        i;
    
    for (i = 0; i < ch; ++i) {
        indices[i] = x < 0 ? (x + size) : x;
        x = (x + hash2) % size;
    }
    
    return indices;
};

Bloom.prototype.add = function (str) {
    var indices = this.getIndices(str + ""),
        ch = this.countHashes,
        i;

    for (i = 0; i < ch; ++i) {
        this.bits[Math.floor(indices[i] / 8)] |= 1 << (indices[i] % 8);
    }
};

Bloom.prototype.test = function(str) {
    var indices = this.getIndices(str + ""),
        ch = this.countHashes,
        i, idx;
    
    for (i = 0; i < ch; ++i) {
        idx = indices[i];
        
        if ((this.bits[Math.floor(idx / 8)] & (1 << (idx % 8))) === 0) {
            return false;
        }
    }

    return true;
};

Bloom.Optimal = (max_members, error_probability) => {
    var size = -(max_members * Math.log(error_probability)) / (Math.LN2 * Math.LN2),
        count = (size / max_members) * Math.LN2;

    size = Math.round(size);
    count = Math.round(count);
    return new Bloom(size, count);
};

module.exports = Bloom;


