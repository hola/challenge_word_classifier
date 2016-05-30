/* MD5 by Sebastian Tschan https://github.com/blueimp/JavaScript-MD5 */
/* big.js v3.1.3 https://github.com/MikeMcl/big.js/LICENCE */
h = function(w,b) {
    /*
     * JavaScript MD5
     * https://github.com/blueimp/JavaScript-MD5
     *
     * Copyright 2011, Sebastian Tschan
     * https://blueimp.net
     *
     * Licensed under the MIT license:
     * http://www.opensource.org/licenses/MIT
     *
     * Based on
     * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
     * Digest Algorithm, as defined in RFC 1321.
     * Version 2.2 Copyright (C) Paul Johnston 1999 - 2009
     * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
     * Distributed under the BSD License
     * See http://pajhome.org.uk/crypt/md5 for more info.
     */

    /*global unescape, define, module */

    md5 = (function ($) {
        'use strict'

        /*
         * Add integers, wrapping at 2^32. This uses 16-bit operations internally
         * to work around bugs in some JS interpreters.
         */
        function safe_add(x, y) {
            var lsw = (x & 0xFFFF) + (y & 0xFFFF)
            var msw = (x >> 16) + (y >> 16) + (lsw >> 16)
            return (msw << 16) | (lsw & 0xFFFF)
        }

        /*
         * Bitwise rotate a 32-bit number to the left.
         */
        function bit_rol(num, cnt) {
            return (num << cnt) | (num >>> (32 - cnt))
        }

        /*
         * These functions implement the four basic operations the algorithm uses.
         */
        function md5_cmn(q, a, b, x, s, t) {
            return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s), b)
        }

        function md5_ff(a, b, c, d, x, s, t) {
            return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t)
        }

        function md5_gg(a, b, c, d, x, s, t) {
            return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t)
        }

        function md5_hh(a, b, c, d, x, s, t) {
            return md5_cmn(b ^ c ^ d, a, b, x, s, t)
        }

        function md5_ii(a, b, c, d, x, s, t) {
            return md5_cmn(c ^ (b | (~d)), a, b, x, s, t)
        }

        /*
         * Calculate the MD5 of an array of little-endian words, and a bit length.
         */
        function binl_md5(x, len) {
            /* append padding */
            x[len >> 5] |= 0x80 << (len % 32)
            x[(((len + 64) >>> 9) << 4) + 14] = len

            var i
            var olda
            var oldb
            var oldc
            var oldd
            var a = 1732584193
            var b = -271733879
            var c = -1732584194
            var d = 271733878

            for (i = 0; i < x.length; i += 16) {
                olda = a
                oldb = b
                oldc = c
                oldd = d

                a = md5_ff(a, b, c, d, x[i], 7, -680876936)
                d = md5_ff(d, a, b, c, x[i + 1], 12, -389564586)
                c = md5_ff(c, d, a, b, x[i + 2], 17, 606105819)
                b = md5_ff(b, c, d, a, x[i + 3], 22, -1044525330)
                a = md5_ff(a, b, c, d, x[i + 4], 7, -176418897)
                d = md5_ff(d, a, b, c, x[i + 5], 12, 1200080426)
                c = md5_ff(c, d, a, b, x[i + 6], 17, -1473231341)
                b = md5_ff(b, c, d, a, x[i + 7], 22, -45705983)
                a = md5_ff(a, b, c, d, x[i + 8], 7, 1770035416)
                d = md5_ff(d, a, b, c, x[i + 9], 12, -1958414417)
                c = md5_ff(c, d, a, b, x[i + 10], 17, -42063)
                b = md5_ff(b, c, d, a, x[i + 11], 22, -1990404162)
                a = md5_ff(a, b, c, d, x[i + 12], 7, 1804603682)
                d = md5_ff(d, a, b, c, x[i + 13], 12, -40341101)
                c = md5_ff(c, d, a, b, x[i + 14], 17, -1502002290)
                b = md5_ff(b, c, d, a, x[i + 15], 22, 1236535329)

                a = md5_gg(a, b, c, d, x[i + 1], 5, -165796510)
                d = md5_gg(d, a, b, c, x[i + 6], 9, -1069501632)
                c = md5_gg(c, d, a, b, x[i + 11], 14, 643717713)
                b = md5_gg(b, c, d, a, x[i], 20, -373897302)
                a = md5_gg(a, b, c, d, x[i + 5], 5, -701558691)
                d = md5_gg(d, a, b, c, x[i + 10], 9, 38016083)
                c = md5_gg(c, d, a, b, x[i + 15], 14, -660478335)
                b = md5_gg(b, c, d, a, x[i + 4], 20, -405537848)
                a = md5_gg(a, b, c, d, x[i + 9], 5, 568446438)
                d = md5_gg(d, a, b, c, x[i + 14], 9, -1019803690)
                c = md5_gg(c, d, a, b, x[i + 3], 14, -187363961)
                b = md5_gg(b, c, d, a, x[i + 8], 20, 1163531501)
                a = md5_gg(a, b, c, d, x[i + 13], 5, -1444681467)
                d = md5_gg(d, a, b, c, x[i + 2], 9, -51403784)
                c = md5_gg(c, d, a, b, x[i + 7], 14, 1735328473)
                b = md5_gg(b, c, d, a, x[i + 12], 20, -1926607734)

                a = md5_hh(a, b, c, d, x[i + 5], 4, -378558)
                d = md5_hh(d, a, b, c, x[i + 8], 11, -2022574463)
                c = md5_hh(c, d, a, b, x[i + 11], 16, 1839030562)
                b = md5_hh(b, c, d, a, x[i + 14], 23, -35309556)
                a = md5_hh(a, b, c, d, x[i + 1], 4, -1530992060)
                d = md5_hh(d, a, b, c, x[i + 4], 11, 1272893353)
                c = md5_hh(c, d, a, b, x[i + 7], 16, -155497632)
                b = md5_hh(b, c, d, a, x[i + 10], 23, -1094730640)
                a = md5_hh(a, b, c, d, x[i + 13], 4, 681279174)
                d = md5_hh(d, a, b, c, x[i], 11, -358537222)
                c = md5_hh(c, d, a, b, x[i + 3], 16, -722521979)
                b = md5_hh(b, c, d, a, x[i + 6], 23, 76029189)
                a = md5_hh(a, b, c, d, x[i + 9], 4, -640364487)
                d = md5_hh(d, a, b, c, x[i + 12], 11, -421815835)
                c = md5_hh(c, d, a, b, x[i + 15], 16, 530742520)
                b = md5_hh(b, c, d, a, x[i + 2], 23, -995338651)

                a = md5_ii(a, b, c, d, x[i], 6, -198630844)
                d = md5_ii(d, a, b, c, x[i + 7], 10, 1126891415)
                c = md5_ii(c, d, a, b, x[i + 14], 15, -1416354905)
                b = md5_ii(b, c, d, a, x[i + 5], 21, -57434055)
                a = md5_ii(a, b, c, d, x[i + 12], 6, 1700485571)
                d = md5_ii(d, a, b, c, x[i + 3], 10, -1894986606)
                c = md5_ii(c, d, a, b, x[i + 10], 15, -1051523)
                b = md5_ii(b, c, d, a, x[i + 1], 21, -2054922799)
                a = md5_ii(a, b, c, d, x[i + 8], 6, 1873313359)
                d = md5_ii(d, a, b, c, x[i + 15], 10, -30611744)
                c = md5_ii(c, d, a, b, x[i + 6], 15, -1560198380)
                b = md5_ii(b, c, d, a, x[i + 13], 21, 1309151649)
                a = md5_ii(a, b, c, d, x[i + 4], 6, -145523070)
                d = md5_ii(d, a, b, c, x[i + 11], 10, -1120210379)
                c = md5_ii(c, d, a, b, x[i + 2], 15, 718787259)
                b = md5_ii(b, c, d, a, x[i + 9], 21, -343485551)

                a = safe_add(a, olda)
                b = safe_add(b, oldb)
                c = safe_add(c, oldc)
                d = safe_add(d, oldd)
            }
            return [a, b, c, d]
        }

        /*
         * Convert an array of little-endian words to a string
         */
        function binl2rstr(input) {
            var i
            var output = ''
            for (i = 0; i < input.length * 32; i += 8) {
                output += String.fromCharCode((input[i >> 5] >>> (i % 32)) & 0xFF)
            }
            return output
        }

        /*
         * Convert a raw string to an array of little-endian words
         * Characters >255 have their high-byte silently ignored.
         */
        function rstr2binl(input) {
            var i
            var output = []
            output[(input.length >> 2) - 1] = undefined
            for (i = 0; i < output.length; i += 1) {
                output[i] = 0
            }
            for (i = 0; i < input.length * 8; i += 8) {
                output[i >> 5] |= (input.charCodeAt(i / 8) & 0xFF) << (i % 32)
            }
            return output
        }

        /*
         * Calculate the MD5 of a raw string
         */
        function rstr_md5(s) {
            return binl2rstr(binl_md5(rstr2binl(s), s.length * 8))
        }

        /*
         * Calculate the HMAC-MD5, of a key and some data (raw strings)
         */
        function rstr_hmac_md5(key, data) {
            var i
            var bkey = rstr2binl(key)
            var ipad = []
            var opad = []
            var hash
            ipad[15] = opad[15] = undefined
            if (bkey.length > 16) {
                bkey = binl_md5(bkey, key.length * 8)
            }
            for (i = 0; i < 16; i += 1) {
                ipad[i] = bkey[i] ^ 0x36363636
                opad[i] = bkey[i] ^ 0x5C5C5C5C
            }
            hash = binl_md5(ipad.concat(rstr2binl(data)), 512 + data.length * 8)
            return binl2rstr(binl_md5(opad.concat(hash), 512 + 128))
        }

        /*
         * Convert a raw string to a hex string
         */
        function rstr2hex(input) {
            var hex_tab = '0123456789abcdef'
            var output = ''
            var x
            var i
            for (i = 0; i < input.length; i += 1) {
                x = input.charCodeAt(i)
                output += hex_tab.charAt((x >>> 4) & 0x0F) +
                    hex_tab.charAt(x & 0x0F)
            }
            return output
        }

        /*
         * Encode a string as utf-8
         */
        function str2rstr_utf8(input) {
            return unescape(encodeURIComponent(input))
        }

        /*
         * Take string arguments and return either raw or hex encoded strings
         */
        return function (s) {
            return rstr2hex(rstr_md5(str2rstr_utf8(s)))
        };
    }(this))

    /* big.js v3.1.3 https://github.com/MikeMcl/big.js/LICENCE */
    B = (function (global) {
        'use strict';

        /*
         big.js v3.1.3
         A small, fast, easy-to-use library for arbitrary-precision decimal arithmetic.
         https://github.com/MikeMcl/big.js/
         Copyright (c) 2014 Michael Mclaughlin <M8ch88l@gmail.com>
         MIT Expat Licence
         */

        /***************************** EDITABLE DEFAULTS ******************************/

        // The default values below must be integers within the stated ranges.

        /*
         * The maximum number of decimal places of the results of operations
         * involving division: div and sqrt, and pow with negative exponents.
         */
        var DP = 0,                           // 0 to MAX_DP

        /*
         * The rounding mode used when rounding to the above decimal places.
         *
         * 0 Towards zero (i.e. truncate, no rounding).       (ROUND_DOWN)
         * 1 To nearest neighbour. If equidistant, round up.  (ROUND_HALF_UP)
         * 2 To nearest neighbour. If equidistant, to even.   (ROUND_HALF_EVEN)
         * 3 Away from zero.                                  (ROUND_UP)
         */
            RM = 1,                            // 0, 1, 2 or 3

        // The maximum value of DP and Big.DP.
            MAX_DP = 1E6,                      // 0 to 1000000

        // The maximum magnitude of the exponent argument to the pow method.
            MAX_POWER = 1E6,                   // 1 to 1000000

        /*
         * The exponent value at and beneath which toString returns exponential
         * notation.
         * JavaScript's Number type: -7
         * -1000000 is the minimum recommended exponent value of a Big.
         */
            E_NEG = -7,                   // 0 to -1000000

        /*
         * The exponent value at and above which toString returns exponential
         * notation.
         * JavaScript's Number type: 21
         * 1000000 is the maximum recommended exponent value of a Big.
         * (This limit is not enforced or checked.)
         */
            E_POS = 21,                   // 0 to 1000000

        /******************************************************************************/

        // The shared prototype object.
            P = {},
            isValid = /^-?(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i,
            Big;


        /*
         * Create and return a Big constructor.
         *
         */
        function bigFactory() {

            /*
             * The Big constructor and exported function.
             * Create and return a new instance of a Big number object.
             *
             * n {number|string|Big} A numeric value.
             */
            function Big(n) {
                var x = this;

                // Enable constructor usage without new.
                if (!(x instanceof Big)) {
                    return n === void 0 ? bigFactory() : new Big(n);
                }

                // Duplicate.
                if (n instanceof Big) {
                    x.s = n.s;
                    x.e = n.e;
                    x.c = n.c.slice();
                } else {
                    parse(x, n);
                }

                /*
                 * Retain a reference to this Big constructor, and shadow
                 * Big.prototype.constructor which points to Object.
                 */
                x.constructor = Big;
            }

            Big.prototype = P;
            Big.DP = DP;
            Big.RM = RM;
            Big.E_NEG = E_NEG;
            Big.E_POS = E_POS;

            return Big;
        }


        // Private functions


        /*
         * Return a string representing the value of Big x in normal or exponential
         * notation to dp fixed decimal places or significant digits.
         *
         * x {Big} The Big to format.
         * dp {number} Integer, 0 to MAX_DP inclusive.
         * toE {number} 1 (toExponential), 2 (toPrecision) or undefined (toFixed).
         */
        function format(x, dp, toE) {
            var Big = x.constructor,

            // The index (normal notation) of the digit that may be rounded up.
                i = dp - (x = new Big(x)).e,
                c = x.c;

            // Round?
            if (c.length > ++dp) {
                rnd(x, i, Big.RM);
            }

            if (!c[0]) {
                ++i;
            } else if (toE) {
                i = dp;

                // toFixed
            } else {
                c = x.c;

                // Recalculate i as x.e may have changed if value rounded up.
                i = x.e + i + 1;
            }

            // Append zeros?
            for (; c.length < i; c.push(0)) {
            }
            i = x.e;

            /*
             * toPrecision returns exponential notation if the number of
             * significant digits specified is less than the number of digits
             * necessary to represent the integer part of the value in normal
             * notation.
             */
            return toE === 1 || toE && (dp <= i || i <= Big.E_NEG) ?

                // Exponential notation.
            (x.s < 0 && c[0] ? '-' : '') +
            (c.length > 1 ? c[0] + '.' + c.join('').slice(1) : c[0]) +
            (i < 0 ? 'e' : 'e+') + i

                // Normal notation.
                : x.toString();
        }


        /*
         * Parse the number or string value passed to a Big constructor.
         *
         * x {Big} A Big number instance.
         * n {number|string} A numeric value.
         */
        function parse(x, n) {
            var e, i, nL;

            // Minus zero?
            if (n === 0 && 1 / n < 0) {
                n = '-0';

                // Ensure n is string and check validity.
            } else if (!isValid.test(n += '')) {
                throwErr(NaN);
            }

            // Determine sign.
            x.s = n.charAt(0) == '-' ? (n = n.slice(1), -1) : 1;

            // Decimal point?
            if ((e = n.indexOf('.')) > -1) {
                n = n.replace('.', '');
            }

            // Exponential form?
            if ((i = n.search(/e/i)) > 0) {

                // Determine exponent.
                if (e < 0) {
                    e = i;
                }
                e += +n.slice(i + 1);
                n = n.substring(0, i);

            } else if (e < 0) {

                // Integer.
                e = n.length;
            }

            // Determine leading zeros.
            for (i = 0; n.charAt(i) == '0'; i++) {
            }

            if (i == (nL = n.length)) {

                // Zero.
                x.c = [x.e = 0];
            } else {

                // Determine trailing zeros.
                for (; n.charAt(--nL) == '0';) {
                }

                x.e = e - i - 1;
                x.c = [];

                // Convert string to array of digits without leading/trailing zeros.
                for (e = 0; i <= nL; x.c[e++] = +n.charAt(i++)) {
                }
            }

            return x;
        }


        /*
         * Round Big x to a maximum of dp decimal places using rounding mode rm.
         * Called by div, sqrt and round.
         *
         * x {Big} The Big to round.
         * dp {number} Integer, 0 to MAX_DP inclusive.
         * rm {number} 0, 1, 2 or 3 (DOWN, HALF_UP, HALF_EVEN, UP)
         * [more] {boolean} Whether the result of division was truncated.
         */
        function rnd(x, dp, rm, more) {
            var u,
                xc = x.c,
                i = x.e + dp + 1;

            if (rm === 1) {

                // xc[i] is the digit after the digit that may be rounded up.
                more = xc[i] >= 5;
            } else if (rm === 2) {
                more = xc[i] > 5 || xc[i] == 5 &&
                    (more || i < 0 || xc[i + 1] !== u || xc[i - 1] & 1);
            } else if (rm === 3) {
                more = more || xc[i] !== u || i < 0;
            } else {
                more = false;

                if (rm !== 0) {
                    throwErr('!Big.RM!');
                }
            }

            if (i < 1 || !xc[0]) {

                if (more) {

                    // 1, 0.1, 0.01, 0.001, 0.0001 etc.
                    x.e = -dp;
                    x.c = [1];
                } else {

                    // Zero.
                    x.c = [x.e = 0];
                }
            } else {

                // Remove any digits after the required decimal places.
                xc.length = i--;

                // Round up?
                if (more) {

                    // Rounding up may mean the previous digit has to be rounded up.
                    for (; ++xc[i] > 9;) {
                        xc[i] = 0;

                        if (!i--) {
                            ++x.e;
                            xc.unshift(1);
                        }
                    }
                }

                // Remove trailing zeros.
                for (i = xc.length; !xc[--i]; xc.pop()) {
                }
            }

            return x;
        }




        /*
         * Return
         * 1 if the value of this Big is greater than the value of Big y,
         * -1 if the value of this Big is less than the value of Big y, or
         * 0 if they have the same value.
         */
        P.cmp = function (y) {
            var xNeg,
                x = this,
                xc = x.c,
                yc = (y = new x.constructor(y)).c,
                i = x.s,
                j = y.s,
                k = x.e,
                l = y.e;

            // Either zero?
            if (!xc[0] || !yc[0]) {
                return !xc[0] ? !yc[0] ? 0 : -j : i;
            }

            // Signs differ?
            if (i != j) {
                return i;
            }
            xNeg = i < 0;

            // Compare exponents.
            if (k != l) {
                return k > l ^ xNeg ? 1 : -1;
            }

            i = -1;
            j = (k = xc.length) < (l = yc.length) ? k : l;

            // Compare digit by digit.
            for (; ++i < j;) {

                if (xc[i] != yc[i]) {
                    return xc[i] > yc[i] ^ xNeg ? 1 : -1;
                }
            }

            // Compare lengths.
            return k == l ? 0 : k > l ^ xNeg ? 1 : -1;
        };


        /*
         * Return a new Big whose value is the value of this Big divided by the
         * value of Big y, rounded, if necessary, to a maximum of Big.DP decimal
         * places using rounding mode Big.RM.
         */
        P.div = function (y) {
            var x = this,
                Big = x.constructor,
            // dividend
                dvd = x.c,
            //divisor
                dvs = (y = new Big(y)).c,
                s = x.s == y.s ? 1 : -1,
                dp = Big.DP;

            if (dp !== ~~dp || dp < 0 || dp > MAX_DP) {
                throwErr('!Big.DP!');
            }

            // Either 0?
            if (!dvd[0] || !dvs[0]) {

                // If both are 0, throw NaN
                if (dvd[0] == dvs[0]) {
                    throwErr(NaN);
                }

                // If dvs is 0, throw +-Infinity.
                if (!dvs[0]) {
                    throwErr(s / 0);
                }

                // dvd is 0, return +-0.
                return new Big(s * 0);
            }

            var dvsL, dvsT, next, cmp, remI, u,
                dvsZ = dvs.slice(),
                dvdI = dvsL = dvs.length,
                dvdL = dvd.length,
            // remainder
                rem = dvd.slice(0, dvsL),
                remL = rem.length,
            // quotient
                q = y,
                qc = q.c = [],
                qi = 0,
                digits = dp + (q.e = x.e - y.e) + 1;

            q.s = s;
            s = digits < 0 ? 0 : digits;

            // Create version of divisor with leading zero.
            dvsZ.unshift(0);

            // Add zeros to make remainder as long as divisor.
            for (; remL++ < dvsL; rem.push(0)) {
            }

            do {

                // 'next' is how many times the divisor goes into current remainder.
                for (next = 0; next < 10; next++) {

                    // Compare divisor and remainder.
                    if (dvsL != (remL = rem.length)) {
                        cmp = dvsL > remL ? 1 : -1;
                    } else {

                        for (remI = -1, cmp = 0; ++remI < dvsL;) {

                            if (dvs[remI] != rem[remI]) {
                                cmp = dvs[remI] > rem[remI] ? 1 : -1;
                                break;
                            }
                        }
                    }

                    // If divisor < remainder, subtract divisor from remainder.
                    if (cmp < 0) {

                        // Remainder can't be more than 1 digit longer than divisor.
                        // Equalise lengths using divisor with extra leading zero?
                        for (dvsT = remL == dvsL ? dvs : dvsZ; remL;) {

                            if (rem[--remL] < dvsT[remL]) {
                                remI = remL;

                                for (; remI && !rem[--remI]; rem[remI] = 9) {
                                }
                                --rem[remI];
                                rem[remL] += 10;
                            }
                            rem[remL] -= dvsT[remL];
                        }
                        for (; !rem[0]; rem.shift()) {
                        }
                    } else {
                        break;
                    }
                }

                // Add the 'next' digit to the result array.
                qc[qi++] = cmp ? next : ++next;

                // Update the remainder.
                if (rem[0] && cmp) {
                    rem[remL] = dvd[dvdI] || 0;
                } else {
                    rem = [dvd[dvdI]];
                }

            } while ((dvdI++ < dvdL || rem[0] !== u) && s--);

            // Leading zero? Do not remove if result is simply zero (qi == 1).
            if (!qc[0] && qi != 1) {

                // There can't be more than one zero.
                qc.shift();
                q.e--;
            }

            // Round?
            if (qi > digits) {
                rnd(q, dp, Big.RM, rem[0] !== u);
            }

            return q;
        };



        /*
         * Return a new Big whose value is the value of this Big minus the value
         * of Big y.
         */
        P.sub = P.minus = function (y) {
            var i, j, t, xLTy,
                x = this,
                Big = x.constructor,
                a = x.s,
                b = (y = new Big(y)).s;

            // Signs differ?
            if (a != b) {
                y.s = -b;
                return x.plus(y);
            }

            var xc = x.c.slice(),
                xe = x.e,
                yc = y.c,
                ye = y.e;

            // Either zero?
            if (!xc[0] || !yc[0]) {

                // y is non-zero? x is non-zero? Or both are zero.
                return yc[0] ? (y.s = -b, y) : new Big(xc[0] ? x : 0);
            }

            // Determine which is the bigger number.
            // Prepend zeros to equalise exponents.
            if (a = xe - ye) {

                if (xLTy = a < 0) {
                    a = -a;
                    t = xc;
                } else {
                    ye = xe;
                    t = yc;
                }

                t.reverse();
                for (b = a; b--; t.push(0)) {
                }
                t.reverse();
            } else {

                // Exponents equal. Check digit by digit.
                j = ((xLTy = xc.length < yc.length) ? xc : yc).length;

                for (a = b = 0; b < j; b++) {

                    if (xc[b] != yc[b]) {
                        xLTy = xc[b] < yc[b];
                        break;
                    }
                }
            }

            // x < y? Point xc to the array of the bigger number.
            if (xLTy) {
                t = xc;
                xc = yc;
                yc = t;
                y.s = -y.s;
            }

            /*
             * Append zeros to xc if shorter. No need to add zeros to yc if shorter
             * as subtraction only needs to start at yc.length.
             */
            if (( b = (j = yc.length) - (i = xc.length) ) > 0) {

                for (; b--; xc[i++] = 0) {
                }
            }

            // Subtract yc from xc.
            for (b = i; j > a;) {

                if (xc[--j] < yc[j]) {

                    for (i = j; i && !xc[--i]; xc[i] = 9) {
                    }
                    --xc[i];
                    xc[j] += 10;
                }
                xc[j] -= yc[j];
            }

            // Remove trailing zeros.
            for (; xc[--b] === 0; xc.pop()) {
            }

            // Remove leading zeros and adjust exponent accordingly.
            for (; xc[0] === 0;) {
                xc.shift();
                --ye;
            }

            if (!xc[0]) {

                // n - n = +0
                y.s = 1;

                // Result must be zero.
                xc = [ye = 0];
            }

            y.c = xc;
            y.e = ye;

            return y;
        };


        /*
         * Return a new Big whose value is the value of this Big modulo the
         * value of Big y.
         */
        P.mod = function (y) {
            var yGTx,
                x = this,
                Big = x.constructor,
                a = x.s,
                b = (y = new Big(y)).s;

            if (!y.c[0]) {
                throwErr(NaN);
            }

            x.s = y.s = 1;
            yGTx = y.cmp(x) == 1;
            x.s = a;
            y.s = b;

            if (yGTx) {
                return new Big(x);
            }

            a = Big.DP;
            b = Big.RM;
            Big.DP = Big.RM = 0;
            x = x.div(y);
            Big.DP = a;
            Big.RM = b;

            return this.minus(x.times(y));
        };


        /*
         * Return a new Big whose value is the value of this Big plus the value
         * of Big y.
         */
        P.add = P.plus = function (y) {
            var t,
                x = this,
                Big = x.constructor,
                a = x.s,
                b = (y = new Big(y)).s;

            // Signs differ?
            if (a != b) {
                y.s = -b;
                return x.minus(y);
            }

            var xe = x.e,
                xc = x.c,
                ye = y.e,
                yc = y.c;

            // Either zero?
            if (!xc[0] || !yc[0]) {

                // y is non-zero? x is non-zero? Or both are zero.
                return yc[0] ? y : new Big(xc[0] ? x : a * 0);
            }
            xc = xc.slice();

            // Prepend zeros to equalise exponents.
            // Note: Faster to use reverse then do unshifts.
            if (a = xe - ye) {

                if (a > 0) {
                    ye = xe;
                    t = yc;
                } else {
                    a = -a;
                    t = xc;
                }

                t.reverse();
                for (; a--; t.push(0)) {
                }
                t.reverse();
            }

            // Point xc to the longer array.
            if (xc.length - yc.length < 0) {
                t = yc;
                yc = xc;
                xc = t;
            }
            a = yc.length;

            /*
             * Only start adding at yc.length - 1 as the further digits of xc can be
             * left as they are.
             */
            for (b = 0; a;) {
                b = (xc[--a] = xc[a] + yc[a] + b) / 10 | 0;
                xc[a] %= 10;
            }

            // No need to check for zero, as +x + +y != 0 && -x + -y != 0

            if (b) {
                xc.unshift(b);
                ++ye;
            }

            // Remove trailing zeros.
            for (a = xc.length; xc[--a] === 0; xc.pop()) {
            }

            y.c = xc;
            y.e = ye;

            return y;
        };








        /*
         * Return a new Big whose value is the value of this Big times the value of
         * Big y.
         */
        P.mul = P.times = function (y) {
            var c,
                x = this,
                Big = x.constructor,
                xc = x.c,
                yc = (y = new Big(y)).c,
                a = xc.length,
                b = yc.length,
                i = x.e,
                j = y.e;

            // Determine sign of result.
            y.s = x.s == y.s ? 1 : -1;

            // Return signed 0 if either 0.
            if (!xc[0] || !yc[0]) {
                return new Big(y.s * 0);
            }

            // Initialise exponent of result as x.e + y.e.
            y.e = i + j;

            // If array xc has fewer digits than yc, swap xc and yc, and lengths.
            if (a < b) {
                c = xc;
                xc = yc;
                yc = c;
                j = a;
                a = b;
                b = j;
            }

            // Initialise coefficient array of result with zeros.
            for (c = new Array(j = a + b); j--; c[j] = 0) {
            }

            // Multiply.

            // i is initially xc.length.
            for (i = b; i--;) {
                b = 0;

                // a is yc.length.
                for (j = a + i; j > i;) {

                    // Current sum of products at this digit position, plus carry.
                    b = c[j] + yc[i] * xc[j - i - 1] + b;
                    c[j--] = b % 10;

                    // carry
                    b = b / 10 | 0;
                }
                c[j] = (c[j] + b) % 10;
            }

            // Increment result exponent if there is a final carry.
            if (b) {
                ++y.e;
            }

            // Remove any leading zero.
            if (!c[0]) {
                c.shift();
            }

            // Remove trailing zeros.
            for (i = c.length; !c[--i]; c.pop()) {
            }
            y.c = c;

            return y;
        };


        /*
         * Return a string representing the value of this Big.
         * Return exponential notation if this Big has a positive exponent equal to
         * or greater than Big.E_POS, or a negative exponent equal to or less than
         * Big.E_NEG.
         */
        P.toString = P.valueOf = P.toJSON = function () {
            var x = this,
                Big = x.constructor,
                e = x.e,
                str = x.c.join(''),
                strL = str.length;

            // Exponential notation?
            if (e <= Big.E_NEG || e >= Big.E_POS) {
                str = str.charAt(0) + (strL > 1 ? '.' + str.slice(1) : '') +
                    (e < 0 ? 'e' : 'e+') + e;

                // Negative exponent?
            } else if (e < 0) {

                // Prepend zeros.
                for (; ++e; str = '0' + str) {
                }
                str = '0.' + str;

                // Positive exponent?
            } else if (e > 0) {

                if (++e > strL) {

                    // Append zeros.
                    for (e -= strL; e--; str += '0') {
                    }
                } else if (e < strL) {
                    str = str.slice(0, e) + '.' + str.slice(e);
                }

                // Exponent zero.
            } else if (strL > 1) {
                str = str.charAt(0) + '.' + str.slice(1);
            }

            // Avoid '-0'
            return x.s < 0 && x.c[0] ? '-' + str : str;
        };


        /*
         ***************************************************************************
         * If toExponential, toFixed, toPrecision and format are not required they
         * can safely be commented-out or deleted. No redundant code will be left.
         * format is used only by toExponential, toFixed and toPrecision.
         ***************************************************************************
         */





        // Export

        return bigFactory();

    })(this);

    h = '0123456789abcdef';
    md5_hash = md5(w);
    a = B(0);
    acc = B(1);
    for(var i=31;i>-1;i--) {
        a=a.plus(acc.mul(h.indexOf(md5_hash[i])));
        acc = acc.mul(16)
    }
    return a.mod(b).toString()
};
console.log(h('allahakbar',8*55000))