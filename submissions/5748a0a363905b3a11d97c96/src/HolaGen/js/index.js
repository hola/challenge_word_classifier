var BloomFilter = (function () {
    // Creates a new bloom filter.  If *m* is an array-like object, with a length
    // property, then the bloom filter is loaded with data from the array, where
    // each element is a 32-bit integer.  Otherwise, *m* should specify the
    // number of bits.  Note that *m* is rounded up to the nearest multiple of
    // 32.  *k* specifies the number of hashing functions.
    function BloomFilter(a, k) {
        var m = a.length * 32;

        var n = Math.ceil(m / 32),
            i = -1;
        this.m = m = n * 32;
        this.k = k;

        var buckets = this.buckets = [];
        while (++i < n) buckets[i] = a[i];
        this._locations = [];
    }

    // See http://willwhim.wpengine.com/2011/09/03/producing-n-hash-functions-by-hashing-only-once/
    BloomFilter.prototype.locations = function (v) {
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

    BloomFilter.prototype.test = function (v) {
        var l = this.locations(v),
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

    return BloomFilter;
})();

//var ArchUtils = (function () {
//    'use strict';

//    // python functions eliminated, Gonzalo

//    /**
//	 * bwt_reverse code from wikipedia (slightly modified)
//	 * @url http://en.wikipedia.org/wiki/Burrows%E2%80%93Wheeler_transform
//	 * @license: CC-SA 3.0
//	 */

//    function bwt_reverse(src, primary) {
//        var len = src.length;

//        //only used on arrays, optimized, Gonzalo
//        var A = src;
//        src = src.join('');
//        A.sort();

//        var start = {};
//        for (var i = len - 1; i >= 0; i--) start[A[i]] = i;

//        var links = [];
//        for (i = 0; i < len; i++) links.push(start[src[i]]++);

//        var i, first = A[i = primary], ret = [];

//        for (var j = 1; j < len; j++) {
//            ret.push(A[i = links[i]]);
//        }
//        return first + ret.reverse().join('');
//    }

//    //move_to_front is always used to store reslt in array, optimized, Gonzalo
//    function move_to_front_and_store(a, c, buff) {
//        var v = a[c];
//        for (var i = c; i > 0; a[i] = a[--i]);
//        buff.push(a[0] = v);
//    }

//    // BitfieldBase never used directly, optimized, Gonzalo
//    /**
//	 * @class RBitfield
//	 * right-sided bitfield for reading bits in byte from right to left
//	 */
//    var RBitfield = function () {
//        this.init = function (x) {
//            this.masks = [];
//            for (var i = 0; i < 31; i++) this.masks[i] = (1 << i) - 1;
//            this.masks[31] = -0x80000000;
//            //eliminated support for RBitfield.init( RBitfield ), never used, Gonzalo
//            this.buffer = x;
//            this.bits = 0;
//            this.bitfield = 0x0;
//            this.count = 0;
//        }
//        //_read not used, optimized, Gonzalo
//        //readByte inlined, Gonzalo
//        //needbits inlined, Gonzalo
//        //align inlined, Gonzalo
//        //toskip inlined, Gonzalo
//        // this.dropbytes not used, eliminated, Gonzalo
//        // this.tell not used, eliminated, Gonzalo
//        // since js truncate args to int32 with bit operators
//        // we need to specific processing for n >= 32 bits reading
//        // separate function is created for optimization purposes
//        //readbits2 always called with constants >=32, check removed, Gonzalo
//        this.readbits2 = function readbits2(n) {
//            //only for n>=32!!!, check removed
//            var n2 = n >> 1;
//            return this.readbits(n2) * (1 << n2) + this.readbits(n - n2);
//        }
//        this.readbits = function readbits(n) {
//            //if (n > this.bits) this.needbits(n);
//            // INLINED: needbits, readByte
//            while (this.bits < n) {
//                this.bitfield = (this.bitfield << 8) + this.buffer[this.count++];
//                this.bits += 8;
//            }
//            var m = this.masks[n];
//            var r = (this.bitfield >> (this.bits - n)) & m;
//            this.bits -= n;
//            this.bitfield &= ~(m << this.bits);
//            return r;
//        }
//    }

//    /**
//	 * @class HuffmanLength
//	 * utility class, used for comparison of huffman codes
//	 */
//    var HuffmanLength = function (code, bits) {
//        this.code = code;
//        this.bits = bits;
//        this.symbol = undefined;
//    } //cropped unused functions and needless checks, Gonzalo

//    //class HuffmanTable never used directly..., optimized, Gonzalo

//    /**
//	 * @class OrderedHuffmanTable
//	 * utility class for working with huffman table
//	 */
//    var OrderedHuffmanTable = function () {
//        this.process = function (lengths) {
//            var len = lengths.length;
//            var z = [];
//            for (var i = 0; i < len; i++) {
//                z.push([i, lengths[i]]);
//            }
//            z.push([len, -1]);

//            var l = [];
//            var b = z[0];
//            var start = b[0], bits = b[1];
//            for (var p = 1; p < z.length; p++) {
//                var finish = z[p][0], endbits = z[p][1];
//                if (bits)
//                    for (var code = start; code < finish; code++)
//                        l.push(new HuffmanLength(code, bits));
//                start = finish;
//                bits = endbits;
//                if (endbits == -1) break;
//            }
//            l.sort(function (a, b) { //function cmpHuffmanTable(a, b), can be anonymous, optimized, Gonzalo
//                return (a.bits - b.bits) || (a.code - b.code);
//            });
//            this.table = l;

//            //inlined populate_huffman_symbols, Gonzalo
//            var temp_bits = 0;
//            var symbol = -1;
//            // faht = Fast Access Huffman Table
//            this.faht = [];
//            var cb = null;
//            for (var i = 0; i < this.table.length; i++) {
//                var x = this.table[i];
//                symbol += 1;
//                if (x.bits != temp_bits) {
//                    symbol <<= x.bits - temp_bits;
//                    cb = this.faht[temp_bits = x.bits] = {};
//                }
//                cb[x.symbol = symbol] = x;
//            }

//            //inlined min_max_bits

//            this.min_bits = 16;
//            this.max_bits = -1;
//            this.table.forEach(function (x) {
//                if (x.bits < this.min_bits) this.min_bits = x.bits;
//                if (x.bits > this.max_bits) this.max_bits = x.bits;
//            }, this);
//        }
//    }

//    return ({
//        bz2: {
//            decode: function (input) { //eliminated unused unpackSize, Gonzalo
//                var b = new RBitfield();
//                b.init(input);
//                b.readbits(16);
//                var method = b.readbits(8);

//                var blocksize = b.readbits(8);
//                if (49 <= blocksize && blocksize <= 57) { //char '1' && char '9'
//                    blocksize -= 48; //char 0
//                }

//                function getUsedCharTable(b) {
//                    var a = [];
//                    var used_groups = b.readbits(16);
//                    for (var m1 = 1 << 15; m1 > 0; m1 >>= 1) {
//                        if (!(used_groups & m1)) {
//                            for (var i = 0; i < 16; i++) a.push(false);
//                            continue;
//                        }
//                        var used_chars = b.readbits(16);
//                        for (var m2 = 1 << 15; m2 > 0; m2 >>= 1) {
//                            a.push(Boolean(used_chars & m2));
//                        }
//                    }
//                    return a;
//                }

//                var out = [];

//                function main_loop() {
//                    while (true) {
//                        var blocktype = b.readbits2(48);
//                        var crc = b.readbits2(32);
//                        if (blocktype == 0x314159265359) { // (pi)
//                            b.readbits(1)
//                            var pointer = b.readbits(24);
//                            var used = getUsedCharTable(b);

//                            var huffman_groups = b.readbits(3);
//                            var mtf = [0, 1, 2, 3, 4, 5, 6].slice(0, huffman_groups); //eliminate use of range, Gonzalo
//                            var selectors_list = [];
//                            for (var i = 0, selectors_used = b.readbits(15) ; i < selectors_used; i++) {
//                                // zero-terminated bit runs (0..62) of MTF'ed huffman table
//                                var c = 0;
//                                while (b.readbits(1)) {
//                                    c++
//                                }
//                                move_to_front_and_store(mtf, c, selectors_list); //optimized to single function, Gonzalo
//                            }
//                            var groups_lengths = [];

//                            // INLINE: sum used only once, Gonzalo
//                            var symbols_in_use = used.reduce(function (a, b) { return a + b }, 0) + 2; //sum(used) + 2 // remember RUN[AB] RLE symbols

//                            for (var j = 0; j < huffman_groups; j++) {
//                                var length = b.readbits(5);
//                                var lengths = [];
//                                for (var i = 0; i < symbols_in_use; i++) {
//                                    while (b.readbits(1)) length -= (b.readbits(1) * 2) - 1;
//                                    lengths.push(length);
//                                }
//                                groups_lengths.push(lengths);
//                            }
//                            var tables = [];
//                            for (var g = 0; g < groups_lengths.length; g++) {
//                                var codes = new OrderedHuffmanTable();
//                                codes.process(groups_lengths[g]); //consolidated function calls
//                                tables.push(codes);
//                            }
//                            var favourites = [];
//                            for (var c = used.length - 1; c >= 0; c--) {
//                                if (used[c]) favourites.push(String.fromCharCode(c)); //inlined chr, used once, Gonzalo
//                            }
//                            favourites.reverse();
//                            var selector_pointer = 0;
//                            var decoded = 0;
//                            var t;

//                            // Main Huffman loop
//                            var repeat = 0;
//                            var repeat_power = 0;
//                            var buffer = [], r;

//                            while (true) {
//                                if (--decoded <= 0) {
//                                    decoded = 50;
//                                    if (selector_pointer <= selectors_list.length)
//                                        t = tables[selectors_list[selector_pointer++]];
//                                }

//                                // INLINED: find_next_symbol
//                                for (var bb in t.faht) {
//                                    if (b.bits < bb) {
//                                        b.bitfield = (b.bitfield << 8) + b.buffer[b.count++];
//                                        b.bits += 8;
//                                    }
//                                    if (r = t.faht[bb][b.bitfield >> (b.bits - bb)]) {
//                                        b.bitfield &= b.masks[b.bits -= bb];
//                                        r = r.code;
//                                        break;
//                                    }
//                                }

//                                if (0 <= r && r <= 1) {
//                                    if (repeat == 0) repeat_power = 1;
//                                    repeat += repeat_power << r;
//                                    repeat_power <<= 1;
//                                    continue;
//                                } else {
//                                    var v = favourites[0];
//                                    for (; repeat > 0; repeat--) buffer.push(v);
//                                }
//                                if (r == symbols_in_use - 1) { // eof symbol
//                                    break;
//                                } else {
//                                    move_to_front_and_store(favourites, r - 1, buffer); //Uninlined, size efficiency, Gonzalo
//                                }
//                            }
//                            var nt = bwt_reverse(buffer, pointer);
//                            var done = [];
//                            var i = 0;
//                            var len = nt.length;
//                            // RLE decoding
//                            while (i < len) {
//                                var c = nt.charCodeAt(i);
//                                if ((i < len - 4)
//                                && nt.charCodeAt(i + 1) == c
//                                && nt.charCodeAt(i + 2) == c
//                                && nt.charCodeAt(i + 3) == c) {
//                                    var c = nt.charAt(i);
//                                    var rep = nt.charCodeAt(i + 4) + 4;
//                                    for (; rep > 0; rep--) done.push(c);
//                                    i += 5;
//                                } else {
//                                    done.push(nt[i++]);
//                                }
//                            }
//                            out.push(done.join(''));
//                        } else if (blocktype == 0x177245385090) { // sqrt(pi)
//                            b.readbits(b.bits & 0x7);  //align
//                            break;
//                        }
//                    }
//                }
//                main_loop();
//                return out.join('');
//            }
//        }
//    });
//})();

(function (exports, buffer, dataSize, binSize, readInt32LE) {
    var sampleSize = 3,
        rejectedSamples = {},
        bloom = null;

    function splitSamples(word) {
        var samples = [],
            i = 0;
        if (word.length < sampleSize) return [];
		word = word + '`';
        for (; i < word.length - sampleSize + 1; i++) {
            samples.push(word.substr(i, sampleSize));
        }
        return samples;
    };
    
    function preExclude(word) {
        if (word.length > 17) return true;
        if (word.slice(-2) == '\'s') word = word.slice(0, -2);
        if (word.match('\'')) return true;
        if (word.match('[^aeyuio]{5,}')) return true
        if (word.match('[fghjkqvwxyz]{3}')) return true
        // if (word.length > 16) return true;
        if (word.length == 0) return true;
        return false;
    }

    var initTxt = function (data) {
        var contents = data.toString(); // ArchUtils.bz2.decode(data);
        var lines = contents.split('\n');
        var line = null;
        var prevLine = '';

        for (var i = 0; i < lines.length; i++) {
            line = lines[i];
            if (line.length == 0) continue;
            var sample = prevLine.substr(0, sampleSize - line.length) + line;
            rejectedSamples[sample] = null;
            prevLine = sample;
        }
    };

    var initBin = function (data) {
        var array = [];
        for (var i = 0; i < data.length / 4; i++) {
            array[i] = readInt32LE.call(data, i * 4);
        }
        bloom = new BloomFilter(array, 15);
    };

    var preSample = function (word, minLength) {
        return (word.length > minLength && word.slice(-2) == '\'s') ? word.slice(0, -2) : word;
    };

    initBin(buffer.slice(0, binSize))
    initTxt(buffer.slice(binSize, binSize + dataSize));

    exports.test = function (word) {
        if (preExclude(word)) return false;

        var samples = splitSamples(preSample(word, 0).substr(9)),
            i = 0;

        for (; i < samples.length; i++) {
            if (samples[i] in rejectedSamples) return false;
        }

        if (!bloom.test(preSample(word, 5).substr(0, 7))) return false;

        return true;
    };
})(exports, b, $DATATXT_SIZE$, $DATABIN_SIZE$, b.readInt32LE);