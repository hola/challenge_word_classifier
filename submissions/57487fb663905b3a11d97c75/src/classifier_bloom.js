/*

Copyright (c) 2011, Jason Davies
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.

  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation
    and/or other materials provided with the distribution.

  * The name Jason Davies may not be used to endorse or promote products
    derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL JASON DAVIES BE LIABLE FOR ANY DIRECT, INDIRECT,
INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE
OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

*/

let bloomfilter = {};

(function(exports) {
    exports.BloomFilter = BloomFilter;
    exports.fnv_1a = fnv_1a;
    exports.fnv_1a_b = fnv_1a_b;

    var typedArrays = typeof ArrayBuffer !== "undefined";

    // Creates a new bloom filter.  If *m* is an array-like object, with a length
    // property, then the bloom filter is loaded with data from the array, where
    // each element is a 32-bit integer.  Otherwise, *m* should specify the
    // number of bits.  Note that *m* is rounded up to the nearest multiple of
    // 32.  *k* specifies the number of hashing functions.
    function BloomFilter(m, k) {
        var a;
        if (typeof m !== "number") a = m, m = a.length * 32;

        var n = Math.ceil(m / 32),
            i = -1;
        this.m = m = n * 32;
        this.k = k;

        if (typedArrays) {
            var kbytes = 1 << Math.ceil(Math.log(Math.ceil(Math.log(m) / Math.LN2 / 8)) / Math.LN2),
                array = kbytes === 1 ? Uint8Array : kbytes === 2 ? Uint16Array : Uint32Array,
                kbuffer = new ArrayBuffer(kbytes * k),
                buckets = this.buckets = new Int32Array(n);
            if (a) while (++i < n) buckets[i] = a[i];
            this._locations = new array(kbuffer);
        } else {
            var buckets = this.buckets = [];
            if (a) while (++i < n) buckets[i] = a[i];
            else while (++i < n) buckets[i] = 0;
            this._locations = [];
        }
    }

    // See http://willwhim.wpengine.com/2011/09/03/producing-n-hash-functions-by-hashing-only-once/
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

    BloomFilter.prototype.add = function(v) {
        var l = this.locations(v + ""),
            k = this.k,
            buckets = this.buckets;
        for (var i = 0; i < k; ++i) buckets[Math.floor(l[i] / 32)] |= 1 << (l[i] % 32);
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

    // Estimated cardinality.
    BloomFilter.prototype.size = function() {
        var buckets = this.buckets,
                bits = 0;
        for (var i = 0, n = buckets.length; i < n; ++i) bits += popcnt(buckets[i]);
        return -this.m * Math.log(1 - bits / this.m) / this.k;
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
})(bloomfilter);

//--------------------------------------------------------------------------------------------------

/*

Copyright (c) 2016 dbohdan

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/

let ERROR_THRESHOLD = 1.6325;

let bloom = null;

let removeAll = (str, regexps, repeatedly=true) => {
    while (repeatedly) {
        let changed = 0;
        regexps.forEach((regexp) => {
            let strOrig = str;
            str = str.replace(regexp, '');
            if (str !== strOrig) {
                changed++;
            };
        });
        if ((changed === 0) || (str === '')) {
            break;
        };
    };
    return str;
};

let stem = (word) => {
    let prefixes = [
        /^under/,  // 0.00026060000000005523
        /^inter/,  // 0.00014939999999996623
        /^semi/,   // 0.000102400000000058
        /^over/,   // 0.00013099999999999223
        /^anti/,   // 0.00020379999999997622
        /^out/,    // 0.00016380000000004724
        /^non/,    // 0.00032440000000000246
        /^un/,     // 0.0008092000000000654
    ];

    let suffixes = [
        /ness$/,   // 0.001462999999999992
        /ment$/,   // 0.00028919999999998947
        /less$/,   // 0.0004414000000000362
        /able$/,   // 0.0005749999999999922
        /ist$/,    // 0.00018339999999994472
        /ing$/,    // 0.003657400000000033
        /ful$/,    // 0.00017959999999994647
        /est$/,    // 0.0007008000000000569
        /ly$/,     // 0.0013504000000000849
        /er$/,     // 0.0008671999999999569
        /ed$/,     // 0.003677400000000053
        /s$/,      // 0.04949820000000005
        /'$/,      // 0.034472999999999976
    ];

    word = removeAll(word, prefixes);
    word = removeAll(word, suffixes);

    return word;
};

let hashWord = (word) => {
    return stem(word);
}

let b = "'serinesonantiteisenatrealrileraarnestliroicorngntlaseitedconiiassmacadecheltotaunlliohemetrnausloasiloldietacnosimithoupehaomiephhinsveeahoosndurceide'lyopamulotprpamoncrsposhgeecabemsacidan'ocadapbapiblbeogscbisua'rtctsoumdos'utagvigakesmgispimaeooeecrodepboirckr'graitshyrytuigivttcuipfitylubrplrurdaumprmrrwat'ovy'qukiburcvagooifoifdrnncleiowfegleoobrnubucupeuexmbibmuegptuiuaguwewirghrpsflfaavylpultwouekaevoayslsakuddupphummayfuefdscyypebm'numsrpslffldghrbtlfrizrld'l'zegsg'oeeysysniunfynewyamygndlughtikahnkvoskycccymafo'rkawksytokyrofi'ggh'ddjarhxizayezotcnygyoxdyrvhlbbyoziazkonplmpynvk'swnrehbswhdnrfnljuydlpjolcnbkljewnyiaxnhoyftnmhnlvlnhsohtwcsc'dgxehmlblfufsblkxtmnsqxaekrwtmuoyglgoznwixbyknp'tnkyeqwskuukgmxpkhwrxodmsvtzzzfyiitfxywlnzezkrdwybdhtbjiaoaasfnjhwuviqu'xcdbajuxmcpnx'ihvuzytpaqdvmlnqbdbtsdw'fsuzlwejdfyuf'gtkwbchbywlhsrktoqsgtgkmkbgwb'cnwbwyz'wddtmfxudczldjhflrbmgbpmzubjyfbhuydprzyxkftdmrpbijyhkkwtwkojcqpfiwhpwmyvrjgduhiybnpcvypwrqhdhcbpxhvrwutvkpmdwfmtykyzgfhkv'bfvsujwpmwbvcdcmhhpdnxtkbwmhhgmvwcxskvkdhvlzgpkcdzuuvltjzhfnpkwwczszbgpgcpfmgcmgsjuquwxlfcdkgkqavvzbcgmkcbwgfbzmkgxbfdxfxmbkfhcfzkvnzsfpkjfwljzwztznfgqi'axwfk'dzdcwzczrhzvdvtpvpjlqgjvkj'mjwzzv'tjnjsvchjgvgzjrrxyyzpcvhqmzxdwvyjxvzgjdq'xn'elx'ldqqsjcvmjytqvgxx'c'ijkxr'nbzfjjpvpxgjhjlvhxq'oqemqjjqrzf'r'vbqjmjtyqzqpzqowj'h'mdxmxqqqttxvfvzbxfvqlfzjfjgjwpqqmqwqdsx'pcjgqjbkqqbqn'b'f'ucxfxjvkzqkxk'g'kfqpxqcqfqvvbvwvxxz'wkxqpqyzjqgqhwq'ygxhxvjwxjqjxjzqjqxqzvqxjzx'j'q'x'z''";
let bigrams = b.match(/../g);

let instaReject = (word, gen_mode=false) => {
    // Length.
    if (word.length > 15) {
        return true;
    }

    if (!gen_mode) {
        let error = 0;
        let f = (x) => (x + 1) * (x + 1);
        for (let i = 0; i < word.length - 1; i++) {
            let bigram = word.slice(i, i + 2);
            let bigramIndex = bigrams.indexOf(bigram);
            if (bigramIndex > -1) {
                error += f((bigramIndex + 1) / bigrams.length);
            };
        };
        error /= word.length;
        if (error >= ERROR_THRESHOLD) {
            return true;
        };
    }

    let vowel_count = (word.match(/[aeiou]/g) || []).length;
    let v_to_c = vowel_count / (word.length - vowel_count);
    if (word.length > 13 && (v_to_c < 0.4)) {
        return true;
    };

    if (word.match(/'/) && !word.match(/(?:'ve|'ll|'s|n't)$/)) {
        return true;
    };

    return false;
};

exports.filename = 'buckets';

/* BEGIN_SKIP */
exports.generate = function (words) {
    let hashedWordSet = {};
    words.forEach((word) => {
        if (!instaReject(word, true) && (Math.random() < (process.env.THRESHOLD || 1.0))) {
            hashedWordSet[hashWord(word)] = true;
        };
    });
    hashedWords = Object.keys(hashedWordSet);
    console.log(`${hashedWords.length} hashed words (${words.length})`);

    let m = ((1 << 16) - 4300) * 8; // bits
    let n = hashedWords.length;
    let k = 1;
    console.log(`m = ${m}, k = ${k}`);

    bloom = new bloomfilter.BloomFilter(m, k);

    hashedWords.forEach((hashedWord) => {
        bloom.add(hashedWord);
    });
};
/* END_SKIP */

exports.test = (word) => {
    return !instaReject(word) && bloom.test(hashWord(word));
};

/* BEGIN_SKIP */
exports.dump = () => {
    fs = require('fs');
    zlib = require('zlib');

    let buffer = Buffer.alloc(bloom.buckets.length * 4);
    let offset = 0;
    bloom.buckets.forEach((int32) => {
        buffer.writeInt32LE(int32, offset);
        offset += 4;
    });

    let bufferCompressed = zlib.gzipSync(buffer, {level: 9});

    fd = fs.openSync(exports.filename, 'w');
    fs.writeSync(fd, bufferCompressed, 0, bufferCompressed.length);
    fs.close(fd);

    fs.writeFileSync('metadata', JSON.stringify({
        m: bloom.m,
        k: bloom.k,
        _locations: bloom._locations,
    }));

    let stats = fs.statSync(exports.filename);
    console.log(`buckets file size: ${stats.size}`);
};
/* END_SKIP */

exports.init = (data) => {
    let {m, k, _locations} = JSON.parse(require('fs').readFileSync('metadata', {encoding:'utf-8'}));

    bloom = new bloomfilter.BloomFilter(m, k);
    bloom._locations = _locations;

    for (let offset = 0; offset < m / 8; offset += 4) {
        let value = data.readInt32LE(offset);
        bloom.buckets[offset / 4] = value;
    };
};
