var bits;
const N = 500001;

function h(str) {
    const OFFSET = 205402;
    const PRIME = 453359;
    var k = OFFSET;
    for (var i = 0; i < str.length; i++) {
        var c = str[i].charCodeAt(0);
        k *= PRIME;
        k %= N;
        k ^= c;
        k %= N;
    }
    return k;
}

exports.init = function (buf) {
    const n = buf.length * 8;
    bits = new Int8Array(n + 30);
    for (var i = 0; i < n; i += 8) {
        var byte = buf.readInt8(i / 8);
        for (var j = 0; j < 8; j++) {
            bits[i + j] = byte & (1 << j);
        }
    }
};

exports.test = function (w) {
    w = w.toLowerCase();
    K = h(w) % N;
    if (K < 0) K += N;
    return !!bits[K];
};