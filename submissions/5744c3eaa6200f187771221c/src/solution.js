'use strict';

let parts = {};
let small = [];

exports.init = function(buf) {
    let count = buf.readUInt16BE(0);
    for (let i = 0; i < count; i++) {
        let word = '';
        for (let j = 0; j < 5; j++) {
            word += String.fromCharCode(buf.readUInt8(2 + j * count + i));
        }
        let flags = word.charCodeAt(4);
        if (flags == 0) {
            small.push(word.substr(0, 4).trim());
        } else {
            let part = [];
            for (let i = 0; i < 8; i++) {
                if (flags & (1 << i)) {
                    part.push(i - 4);
                }
            }
            parts[word.substr(0, 4).split('\0').join('')] = part;
        }
    }
};

exports.test = function(w) {
    if (w.length == 1) {
        return "'" !== w;
    }
    if (w.length > 60) {
        return false;
    }
    if (w[0] === "'" || w[w.length - 1] === "'") {
        return false;
    }
    w = w.replace(/'s$/, '');
    if (w.length < 4) {
        return -1 !== small.indexOf(w);
    } else {
        let maxIndex = Math.ceil(w.length / 4);
        for (let i = 0, rI = maxIndex; i < maxIndex; i++, rI--) {
            let part = parts[w.substr(4 * i, 4)];
            if (undefined === part || (i < 4 && -1 === part.indexOf(i)) || (rI <= 4 && -1 === part.indexOf(-1 * rI))) {
                return false;
            }
        }
        return true;
    }
};
