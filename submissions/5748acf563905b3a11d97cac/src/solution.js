var bloom, bloomSize = 65536, spammy = {};

function hash(s, seed) {
    var i, hash = 1;
    for (i = 0; i < s.length; i++) {
        hash = Math.imul(seed, hash) + s.charCodeAt(i);
    }
    return hash >>> 0;
}

exports.init = function(buf) {
    var i, current = {},
        c, node, s;

    bloom = buf;

    for (i = bloomSize; i < buf.length; i++) {
        c = buf[i];
        if (c == 60) {
            current = current.p;
        } else if (c == 32) {
            s = "";
            for (node = current; node.p; node = node.p) {
                s = String.fromCharCode(node.c) + s;
            }
            spammy[s] = 1;
        } else {
            current = {
                p: current,
                c: c
            };
        }
    }
};

exports.test = function(word) {
    var length = word.length,
        i, ngram, ngrams, h;

    if (length > 16) {
        return false;
    }

    for (var n = 1; n < 6; n++) {
        for (i = 0; i <= length - n; i++) {
            ngram = word.substr(i, n);
            if (spammy[ngram] || spammy[ngram + i]) {
                return false;
            }
        }
    }

    ngrams = (length < 8) ? ["^" + word + "$"] : ["^" + word.substr(0, 7), word.substr(7) + "$"];
    for (i = 0; i < ngrams.length; i++) {
        h = hash(ngrams[i], 4047020491) % (bloomSize*8);
        if (!((bloom[h/8|0] >> (h%8)) & 1)) {
            return false;
        }
    }

    return true;
};
