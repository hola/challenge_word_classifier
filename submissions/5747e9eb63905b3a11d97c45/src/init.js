/**
 * Bloom Filter is based on https://github.com/jasondavies/bloomfilter.js
 *
 * @param {type} m
 * @returns {BloomFilter}
 */
function BloomFilter(m) {
    var a, k = 1;
    if (typeof m !== "number")
        a = m, m = a.length * 32;
    var n = Math.ceil(m / 32),
            i = -1;
    this.m = m = n * 32;
    this.k = k;

    var kbytes = 1 << Math.ceil(Math.log(Math.ceil(Math.log(m) / Math.LN2 / 8)) / Math.LN2),
            array = kbytes === 1 ? Uint8Array : kbytes === 2 ? Uint16Array : Uint32Array,
            kbuffer = new ArrayBuffer(kbytes * k),
            b = this.b = new Int32Array(n);
    if (a)
        while (++i < n)
            b[i] = a[i];
    this._l = new array(kbuffer);
}
BloomFilter.prototype = {
    add: function (v) {
        var i, l = this.l(v + "");
        for (i = 0; i < this.k; ++i)
            this.b[Math.floor(l[i] / 32)] |= 1 << (l[i] % 32);
    },
    test: function (v) {
        var b, i, l = this.l(v + "");
        for (i = 0; i < this.k; ++i) {
            b = l[i];
            if ((this.b[Math.floor(b / 32)] & (1 << (b % 32))) === 0) {
                return false;
            }
        }
        return true;
    },
    toHex: function () {
        return this.b.reduce(function (out, int) {
            return out + ('00000000' + (int < 0 ? (0xFFFFFFFF + int + 1) : int).toString(16)).substr(-8);
        }, '');
    },
    l: function (v) {
        var i, m = this.m,
                r = this._l,
                a = fnv_1a(v),
                b = fnv_1a_b(a),
                x = a % m;
        for (i = 0; i < this.k; ++i) {
            r[i] = x < 0 ? (x + m) : x;
            x = (x + b) % m;
        }
        return r;

        function fnv_1a(v) {
            var a = 2166136261, c, d, i;
            for (i = 0, n = v.length; i < n; ++i) {
                c = v.charCodeAt(i);
                d = c & 0xff00;
                if (d)
                    a = fnv_multiply(a ^ d >> 8);
                a = fnv_multiply(a ^ c & 0xff);
            }
            return fnv_mix(a);
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
        function fnv_multiply(a) {
            return a + (a << 1) + (a << 4) + (a << 7) + (a << 8) + (a << 24);
        }
    }
};



var fs = require('fs');
var zlib = require('zlib');
var zopfli = require('node-zopfli');

var filter = function (word) {
    return word.length > 5 || used[word] > 1;
};
var used = {};
var words = require('../words.json');

function H(w, f, t) {
    f = f.split('|'), t = t.split('|');
    for (var i = 0; i < f.length; i++) {
        w = w.replace(new RegExp(f[i], 'g'), t[i]);
    }
    return w;
}

words.forEach(function (w) {
    var L = 'length', M = 'match', R = 'replace';
        w = w[R](/'s$/,'');
        if (w[M](/([a-z])\1{2}|'/) || w[R](/([cpst])h|(s)t/g, '$1$2')[M](/[^aeiouy]{5}/)) {
            return false;
        }
        w = w[R](/^(a(ero|fter|ir|nti|qua|rchi|stro|uto)|back|bio|blood|counter|down|ecto|electro|endo|extra|fore|geo|he(ad|mato|m[io]|tero|xa)|hi(gh|ppo|sto)|ho[lm]o|hy(dro|per|po)|inter|m[ai]cro|me[gt]a|mono|multi|neo|neuro|nitro|o(mni|rtho|steo|ut|ver|xy)|p(ala?eo|ara|enta|hyto|leuro|neumo|oly|ost|roto|seudo|sycho|yro)|radio|semi|socio|super|supra|t(echno|ele|etra|hermo|urbo|urn)|ultra|under|urano|water|zoo|zygo|de|dis|i[lmnr]|non|mis|p?re|sub|un|up)|(ess|ing|ion|ism|ist|nes)?(e?s)?$/g, '')[R](/(e[dr]|ly|ment)$/, '')[R](/([cn])al$/, '$1')[R](/([ai]ble|([ai]bil)?it[iy]|a[el]|i[ac]|ou|[aeiuy])$/, '');
        if (!w[M](/^([^aefijoquvxy][aeiouy]|[fjovy][aeiou]|[aei][abcdglmnprstv]|[bcgkp][hlr]|a[efhikquwxyz]|bs|d[hrw]|e[fioquxy]|f[lr]|gn|io|kn|mc|o[^aehijoquy]|p[nst]|qu|rh|s[chklmnpqtw]|t[hrsw]|u[lmnprst]|w[hr]|x[aeiy])/)
                || w[M](/'|([bfgjkmpqvwxz][qx]|[cdhst]x|[bfjkpqvx]z|[jqv][bfhjpw]|[jq][glmtv]|cj|fv|q[cdeknory]|wj|x[gjk]|yq|z[fj])/)
                || !w[R](/[^aeiouy]/g, '')[L]
                || w.length > 13
            //|| !b.test(w.substr(0,7))
            ) {
        return false;
    }
    //w = w.substr(0, 10);
    if (!used[w]) {
        used[w] = 0;
    }
    used[w]++;
});

console.log('Number of words: ' + Object.keys(used).filter(filter).length);

var testFileSize = fs.statSync('test.js').size;

for (var size = 18375; size > 15700; size--) { // 17493 - for 5:1, 17237 for 4:1, 17140 for 3:1
    var bloom = new BloomFilter(32 * size);

    Object.keys(used).filter(filter).forEach(function (word) {
        bloom.add(word);
    });

    //var data = zlib.gzipSync(Buffer.from(bloom.toHex(), 'hex'), {level: 9, strategy: 3});
    var data = zopfli.gzipSync(Buffer.from(bloom.toHex(), 'hex'), {numiterations: 400});


    var fileSize = (data.length + testFileSize);
    console.log("Bloom size: " + size + ", file size: " + fileSize);
    if (fileSize < 65536) {
        fs.writeFileSync("data.bin", Buffer.from(bloom.toHex(), 'hex'));
        fs.writeFileSync("data.gz", data);
        break;
    }
}
console.log('Done');