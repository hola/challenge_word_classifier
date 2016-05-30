M = Math;
    md5 = function (string) {

        function cmn(q, a, b, x, s, t) {
            a = add32(add32(a, q), add32(x, t));
            return add32((a << s) | (a >>> (32 - s)), b);
        }


        function ff(a, b, c, d, x, s, t) {
            return cmn((b & c) | ((~b) & d), a, b, x, s, t);
        }

        function gg(a, b, c, d, x, s, t) {
            return cmn((b & d) | (c & (~d)), a, b, x, s, t);
        }

        function hh(a, b, c, d, x, s, t) {
            return cmn(b ^ c ^ d, a, b, x, s, t);
        }

        function ii(a, b, c, d, x, s, t) {
            return cmn(c ^ (b | (~d)), a, b, x, s, t);
        }


        function md5cycle(x, k) {
            var a = x[0], b = x[1], c = x[2], d = x[3];

            a = ff(a, b, c, d, k[0], 7, -680876936);
            d = ff(d, a, b, c, k[1], 12, -389564586);
            c = ff(c, d, a, b, k[2], 17, 606105819);
            b = ff(b, c, d, a, k[3], 22, -1044525330);
            a = ff(a, b, c, d, k[4], 7, -176418897);
            d = ff(d, a, b, c, k[5], 12, 1200080426);
            c = ff(c, d, a, b, k[6], 17, -1473231341);
            b = ff(b, c, d, a, k[7], 22, -45705983);
            a = ff(a, b, c, d, k[8], 7, 1770035416);
            d = ff(d, a, b, c, k[9], 12, -1958414417);
            c = ff(c, d, a, b, k[10], 17, -42063);
            b = ff(b, c, d, a, k[11], 22, -1990404162);
            a = ff(a, b, c, d, k[12], 7, 1804603682);
            d = ff(d, a, b, c, k[13], 12, -40341101);
            c = ff(c, d, a, b, k[14], 17, -1502002290);
            b = ff(b, c, d, a, k[15], 22, 1236535329);

            a = gg(a, b, c, d, k[1], 5, -165796510);
            d = gg(d, a, b, c, k[6], 9, -1069501632);
            c = gg(c, d, a, b, k[11], 14, 643717713);
            b = gg(b, c, d, a, k[0], 20, -373897302);
            a = gg(a, b, c, d, k[5], 5, -701558691);
            d = gg(d, a, b, c, k[10], 9, 38016083);
            c = gg(c, d, a, b, k[15], 14, -660478335);
            b = gg(b, c, d, a, k[4], 20, -405537848);
            a = gg(a, b, c, d, k[9], 5, 568446438);
            d = gg(d, a, b, c, k[14], 9, -1019803690);
            c = gg(c, d, a, b, k[3], 14, -187363961);
            b = gg(b, c, d, a, k[8], 20, 1163531501);
            a = gg(a, b, c, d, k[13], 5, -1444681467);
            d = gg(d, a, b, c, k[2], 9, -51403784);
            c = gg(c, d, a, b, k[7], 14, 1735328473);
            b = gg(b, c, d, a, k[12], 20, -1926607734);

            a = hh(a, b, c, d, k[5], 4, -378558);
            d = hh(d, a, b, c, k[8], 11, -2022574463);
            c = hh(c, d, a, b, k[11], 16, 1839030562);
            b = hh(b, c, d, a, k[14], 23, -35309556);
            a = hh(a, b, c, d, k[1], 4, -1530992060);
            d = hh(d, a, b, c, k[4], 11, 1272893353);
            c = hh(c, d, a, b, k[7], 16, -155497632);
            b = hh(b, c, d, a, k[10], 23, -1094730640);
            a = hh(a, b, c, d, k[13], 4, 681279174);
            d = hh(d, a, b, c, k[0], 11, -358537222);
            c = hh(c, d, a, b, k[3], 16, -722521979);
            b = hh(b, c, d, a, k[6], 23, 76029189);
            a = hh(a, b, c, d, k[9], 4, -640364487);
            d = hh(d, a, b, c, k[12], 11, -421815835);
            c = hh(c, d, a, b, k[15], 16, 530742520);
            b = hh(b, c, d, a, k[2], 23, -995338651);

            a = ii(a, b, c, d, k[0], 6, -198630844);
            d = ii(d, a, b, c, k[7], 10, 1126891415);
            c = ii(c, d, a, b, k[14], 15, -1416354905);
            b = ii(b, c, d, a, k[5], 21, -57434055);
            a = ii(a, b, c, d, k[12], 6, 1700485571);
            d = ii(d, a, b, c, k[3], 10, -1894986606);
            c = ii(c, d, a, b, k[10], 15, -1051523);
            b = ii(b, c, d, a, k[1], 21, -2054922799);
            a = ii(a, b, c, d, k[8], 6, 1873313359);
            d = ii(d, a, b, c, k[15], 10, -30611744);
            c = ii(c, d, a, b, k[6], 15, -1560198380);
            b = ii(b, c, d, a, k[13], 21, 1309151649);
            a = ii(a, b, c, d, k[4], 6, -145523070);
            d = ii(d, a, b, c, k[11], 10, -1120210379);
            c = ii(c, d, a, b, k[2], 15, 718787259);
            b = ii(b, c, d, a, k[9], 21, -343485551);

            x[0] = add32(a, x[0]);
            x[1] = add32(b, x[1]);
            x[2] = add32(c, x[2]);
            x[3] = add32(d, x[3]);

        }


        function md51(s) {
            txt = '';
            var n = s.length,
                state = [1732584193, -271733879, -1732584194, 271733878], i;
            for (i = 64; i <= n; i += 64) {
                md5cycle(state, md5blk(s.substring(i - 64, i)));
            }
            s = s.substring(i - 64);
            var tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], sl = s.length;
            for (i = 0; i < sl; i++)    tail[i >> 2] |= s.charCodeAt(i) << ((i % 4) << 3);
            tail[i >> 2] |= 0x80 << ((i % 4) << 3);
            if (i > 55) {
                md5cycle(state, tail);
                i = 16;
                while (i--) {
                    tail[i] = 0
                }
                //			for (i=0; i<16; i++) tail[i] = 0;
            }
            tail[14] = n * 8;
            md5cycle(state, tail);
            return state;
        }

        /* there needs to be support for Unicode here,
         * unless we pretend that we can redefine the MD-5
         * algorithm for multi-byte characters (perhaps
         * by adding every four 16-bit characters and
         * shortening the sum to 32 bits). Otherwise
         * I suggest performing MD-5 as if every character
         * was two bytes--e.g., 0040 0025 = @%--but then
         * how will an ordinary MD-5 sum be matched?
         * There is no way to standardize text to something
         * like UTF-8 before transformation; speed cost is
         * utterly prohibitive. The JavaScript standard
         * itself needs to look at this: it should start
         * providing access to strings as preformed UTF-8
         * 8-bit unsigned value arrays.
         */
        function md5blk(s) {        /* I figured global was faster.   */
            var md5blks = [], i;
            /* Andy King said do it this way. */
            for (i = 0; i < 64; i += 4) {
                md5blks[i >> 2] = s.charCodeAt(i)
                    + (s.charCodeAt(i + 1) << 8)
                    + (s.charCodeAt(i + 2) << 16)
                    + (s.charCodeAt(i + 3) << 24);
            }
            return md5blks;
        }

        var hex_chr = '0123456789abcdef'.split('');

        function rhex(n) {
            var s = '', j = 0;
            for (; j < 4; j++)    s += hex_chr[(n >> (j * 8 + 4)) & 0x0F] + hex_chr[(n >> (j * 8)) & 0x0F];
            return s;
        }

        function hex(x) {
            var l = x.length;
            for (var i = 0; i < l; i++)    x[i] = rhex(x[i]);
            return x.join('');
        }

        /* this function is much faster,
         so if possible we use it. Some IEs
         are the only ones I know of that
         need the idiotic second function,
         generated by an if clause.  */

        function add32(a, b) {
            return (a + b) & 0xFFFFFFFF;
        }

        if (hex(md51("hello")) != "5d41402abc4b2a76b9719d911017c592") {
            function add32(x, y) {
                var lsw = (x & 0xFFFF) + (y & 0xFFFF),
                    msw = (x >> 16) + (y >> 16) + (lsw >> 16);
                return (msw << 16) | (lsw & 0xFFFF);
            }
        }

        return hex(md51(string));
    }

// end md5.js

function BitField(arg) {

    this.bits = (arg && arg['bits']) ? arg['bits'] : 307;
    this.bucketsize = (arg && arg['bucketsize']) ? arg['bucketsize'] : 31;

    this.nbuckets = Math.ceil(this.bits / this.bucketsize);

    if (arg && arg['buckets'])
        this.buckets = arg['buckets'];
    else {
        this.buckets = [];
        for (var x = 0; x < this.nbuckets; ++x) this.buckets[x] = 0;
    }
}

BitField.prototype.setbit = function (b) {
    var bn = Math.floor(b / this.bucketsize);
    var bit = b % this.bucketsize;
    this.buckets[bn] |= Math.pow(2, bit);
};

BitField.prototype.bitset = function (b) {
    var bn = Math.floor(b / this.bucketsize);
    var bit = b % this.bucketsize;
    return ( ((this.buckets[bn] & Math.pow(2, bit)) == 0) ? false : true );
};

BitField.prototype.as_string = function (base) {
    if (!base) base = 2;
    var s = '';
    for (var i = 0; i < this.buckets.length; ++i) {
        s += this.buckets[i].toString(base) + "\n";
    }
    return s;
};

function BloomFilter(arg) {
    if (!arg) throw "Missing arguments!";
    if (!arg['salts']) throw "Missing salts list!";

    this.salts = arg['salts']; // should check that it's an array
    this.bits = (arg['bits']) ? arg['bits'] : 200;
    this.bucketsize = arg['bucketsize'] ? arg['bucketsize'] : 31;

    var bfarg = {bits: this.bits, bucketsize: this.bucketsize};

    if (arg['buckets']) bfarg['buckets'] = arg['buckets'];

    this.bitfield = new BitField(bfarg);
}

BloomFilter.prototype.hashes = function (v) {
    var r = [];
    for (var i = 0, s; s = this.salts[i]; ++i)
        r[i] = (parseInt(md5(s + v).substr(0, 7), 16) % this.bits);
    return r;
};

BloomFilter.prototype.add = function (v) {
    var hashes = this.hashes(v);
    for (var i = 0, h; h = hashes[i]; ++i) this.bitfield.setbit(h);
};

BloomFilter.prototype.test = function (v) {
    var hashes = this.hashes(v);

    var j = 0;
    for (var i = 0, h; h = hashes[i]; ++i) {
        if (this.bitfield.bitset(h)) j++;
    }

    j = j/hashes.length;
    return j;
};

var bits = 530165;
// var bloom = new BF({bits: bits, salts: ['poiuytre', 'asdfghjkl', 'mnbvcxz']});
//
// var fs = require('fs'),
//     prefixes = fs.readFileSync('./tmp/prefixes6', 'utf8').split("\n");
//
// for (var i in prefixes) {
//     bloom.add(prefixes[i].split("\t")[0]);
// }
//
// var s = '';
// for (var i = 0; i < bloom.BV.bits; i++ ) {
//     s += bloom.BV.bitset(i) ? '1' : '0';
// }
//
// var b = [];
// for (var i = 0; i <= s.length; i = i + 8) {
//     b.push(parseInt(s.substr(i, 8), 2));
// }
//
// var buff = new Buffer(b);
// fs.writeFileSync('bloom.filter', buff, 'binary');

module.exports.init = function(buff) {
    bloom = new BF({bits: bits, salts: ['poiuytre', 'asdfghjkl', 'mnbvcxz']});

    var s = '';
    for (var i = 0; i < bits/8; i++) {
        s += ("000000000" + (buff.readUInt8(i) >>> 0).toString(2)).substr(-8);
    }

    for (var i = 0; i <= bits; i++) {
        1 == s[i] && bloom.BV.setbit(i);
    }
};



var cs = 'bcdfghjklmnpqrstvxz'.split('');
module.exports.test = function(word) {
    if (word.length > 13) {
        return 0;
    }


    var a = word.split(''),
        c = 0;
    for (var i in a) {
        if (cs.indexOf(a[i]) > 0) {
            c++;
        } else {
            c = 0;
        }

        if (c >= 5) {
            return 0;
        }
    }

    if (word.indexOf("''") >= 0) {
        return 0;
    }

    if (word.indexOf("'") >= 0 && word.indexOf("'") != word.length - 2) {
        return 0;
    }

    return bloom.test(word.substr(0, 6));
};
//
// var fs = require('fs');
// module.exports.init(fs.readFileSync('bloom.filter'));
//
//
// var results = [[0,0],[0,0]];
// var testcases = './source/cases';
// var global_score = 0, total = 0, c = 0;
// for (var file of fs.readdirSync(testcases).sort()) {
//     var tc = JSON.parse(fs.readFileSync(`${testcases}/${file}`, 'utf8'));
//     var score = 0;
//     for (var word in tc) {
//         var correct = tc[word];
//         var res = module.exports.test(word);
//
//         if (res == correct) {
//             score++;
//             global_score++;
//
//             results[correct ? 1 : 0][1]++;
//         }
//
//         results[correct ? 1 : 0][0]++;
//     }
//     total++;
// }
//
// console.log(results);
// console.log('Negatives ', results[0][1]/results[0][0]);
// console.log('Positives ', results[1][1]/results[1][0]);
//
// console.log(`${global_score / total}%`);