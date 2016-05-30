'use strict';
var words = [];
exports.init = function (data) {
    var bits = [];
    for (var i = 0; i < data.length; i++) {
        var num = data.readUInt8(i);
        var tmpBits = toBits(num);
        for (var j in tmpBits) {
            bits.push(tmpBits[j]);
        }
    }
    var word = "";
    for (var i = 0; i < bits.length; i += 5) {
        var tmpBits = [];
        tmpBits[0] = bits[i];
        tmpBits[1] = bits[i + 1];
        tmpBits[2] = bits[i + 2];
        tmpBits[3] = bits[i + 3];
        tmpBits[4] = bits[i + 4];
        var code = fromBits(tmpBits);
        if (code === nl) {
            words.push(word);
            word = "";
        } else {
            var c = -1;
            for (var j in symb) {
                if (symb[j] === code) {
                    c = j;
                    break;
                }
            }
            word += c;
        }
    }
};

exports.test = function (word) {
    word = word.toLowerCase(); 
    for (var i in words) {
        if (words[i] === word)
            return true;
    }
    for (var i in words) {
        if (words[i].indexOf(word) !== -1) {
            if (word.indexOf('\'s') !== -1) {
                return true;
            }
            if (word.indexOf('\'d') !== -1) {
                return true;
            }
            if (word.indexOf('\'t') !== -1) {
                return true;
            }
            if (word.indexOf('\'re') !== -1) {
                return true;
            }
            if (word.indexOf('\'th') !== -1) {
                return true;
            }
        }
    }
    return false;
};

function toBits(value) {
    var bits = [];
    for (var i = 7; i >= 0; i--) {
        var bit = value & (1 << i) ? 1 : 0;
        bits.push(bit);
    }
    return bits;
}

function fromBits(bits) {
    var tmp = "";
    for (var i = 0; i < bits.length; i++) {
        tmp += bits[i];
    }
    return parseInt(tmp, 2);
}

var symb = {
    a: 4,
    b: 9,
    c: 13,
    d: 15,
    e: 2,
    f: 11,
    g: 10,
    h: 14,
    i: 3,
    j: 12,
    k: 28,
    l: 30,
    m: 26,
    n: 27,
    o: 7,
    p: 31,
    q: 29,
    r: 25,
    s: 17,
    t: 21,
    u: 5,
    v: 23,
    w: 19,
    x: 18,
    y: 1,
    z: 22
};

var nl = 0;