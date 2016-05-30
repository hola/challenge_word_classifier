var bits;

const N = 500001;
const SEED = 268949;
const MOD = N;


function hasheet(str) {
    const OFFSET = 205402
    ;
    const PRIME = 453359;
    var k = OFFSET;
    for (var i = 0; i < str.length; i++) {
        var c = str[i].charCodeAt(0);
        k *= PRIME;
        k %= MOD;
        k ^= c;
        k %= MOD;
    }
    return k;
}


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

        k1 = ((((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16))) & 0xffffffff;
        k1 = (k1 << 15) | (k1 >>> 17);
        k1 = ((((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16))) & 0xffffffff;

        h1 ^= k1;
        h1 = (h1 << 13) | (h1 >>> 19);
        h1b = ((((h1 & 0xffff) * 5) + ((((h1 >>> 16) * 5) & 0xffff) << 16))) & 0xffffffff;
        h1 = (((h1b & 0xffff) + 0x6b64) + ((((h1b >>> 16) + 0xe654) & 0xffff) << 16));
    }

    k1 = 0;

    switch (remainder) {
        case 3: k1 ^= (key.charCodeAt(i + 2) & 0xff) << 16;
        case 2: k1 ^= (key.charCodeAt(i + 1) & 0xff) << 8;
        case 1: k1 ^= (key.charCodeAt(i) & 0xff);

            k1 = (((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16)) & 0xffffffff;
            k1 = (k1 << 15) | (k1 >>> 17);
            k1 = (((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16)) & 0xffffffff;
            h1 ^= k1;
    }

    h1 ^= key.length;

    h1 ^= h1 >>> 16;
    h1 = (((h1 & 0xffff) * 0x85ebca6b) + ((((h1 >>> 16) * 0x85ebca6b) & 0xffff) << 16)) & 0xffffffff;
    h1 ^= h1 >>> 13;
    h1 = ((((h1 & 0xffff) * 0xc2b2ae35) + ((((h1 >>> 16) * 0xc2b2ae35) & 0xffff) << 16))) & 0xffffffff;
    h1 ^= h1 >>> 16;

    return h1 >>> 0;
}

exports.init = function (buf) {
    const m = buf.length;
    const n = m * 8;
    console.log("BITS = " + n + " BYTES = " + m);
    bits = new Int8Array(n + 30);
    var i;
    for (i = 0; i < n; i += 8) {
        var byte = buf.readInt8(i / 8);
        for (var j = 0; j < 8; j++) {
            bits[i + j] = byte & (1 << j);
        }
    }

    var filled = 0.0;
    for (i = 0; i < n; i++) {
        bits[i] = !!bits[i];
        if (bits[i]) {
            filled += 1;
        }
    }

    console.log(filled / n);
    console.log("hash(goodlord) = " + hasheet("goodlord"));

    var str = "Frist 24 bits: ";
    for (i = 0; i < 24; i++) {
        str += bits[i] + ' ';
    }
    console.log(str);

    // N = m;

    // console.log(bits);
};

exports.test = function (word) {
    word = word.toLowerCase();
    // K = murmurhash3_32_gc(word, SEED) % N;
    K = hasheet(word) % N;
    if (K < 0) K += N;

    return !!bits[K];
};