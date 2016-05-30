function BloomFilter(m, k) {
    var a;
    if (typeof m !== "number") a = m, m = a.length * 32;

    var n = Math.ceil(m / 32),
        i = -1;
    this.m = m = n * 32;
    this.k = k;

    var kbytes = 1 << Math.ceil(Math.log(Math.ceil(Math.log(m) / Math.LN2 / 8)) / Math.LN2),
        array = kbytes === 1 ? Uint8Array : kbytes === 2 ? Uint16Array : Uint32Array,
        kbuffer = new ArrayBuffer(kbytes * k),
        buckets = this.buckets = new Int32Array(n);
    if (a) while (++i < n) buckets[i] = a[i];
    this._locations = new array(kbuffer);
}

BloomFilter.prototype.locations = function(v) {
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

BloomFilter.prototype.test = function(v) {
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

function fnv_multiply(a) {
    return a + (a << 1) + (a << 4) + (a << 7) + (a << 8) + (a << 24);
}

function fnv_1a_b(a) {
    return fnv_mix(fnv_multiply(a));
}

function fnv_mix(a) {
    a += a << 13;
    a ^= a >>> 7;
    a += a << 3;
    a ^= a >>> 17;
    a += a << 5;
    return a & 0xffffffff;
}

b = new BloomFilter(d.d, d.h);
module.exports.test = function(w) {
    w = w.toLowerCase();
    var aNGrams = [], l = d.l;
    for (var f = 0, t = w.length - l; f <= t; ++f)
        if (b.test(w.substr(f, l)) === false)
            return false;
    return true;
}
