var B = {}, L = 'length', M = 'match', R = 'replace';

module.exports = {
    init: function (d) {
        for (var i = 0, m = d[L] / 4, o = new Int32Array(m), l = m * 32; i < m; i++) {
            o[i] = d.readInt32BE(i * 4);
        }
        B.t = function (v) {
            for (var a = 2166136261, b, c, d, i = 0, q = function (a) {
                return a + (a << 1) + (a << 4) + (a << 7) + (a << 8) + (a << 24);
            }; i < v[L]; ++i) {
                c = v.charCodeAt(i);
                d = c & 0xff00;
                if (d)
                    a = q(a ^ d >> 8);
                a = q(a ^ c & 0xff);
            }
            a += a << 13;
            a ^= a >>> 7;
            a += a << 3;
            a ^= a >>> 17;
            a += a << 5;

            b = (a & 0xffffffff) % l;
            b = b < 0 ? (b + l) : b;
            return (o[Math.floor(b / 32)] & (1 << (b % 32))) !== 0;
        };
    },
    test: function (w) {
        w = w[R](/'s$/,'');
        if (w[M](/([a-z])\1{2}|'/) || w[R](/([cpst])h|(s)t/g, '$1$2')[M](/[^aeiouy]{5}/)) {
            return false;
        }
        w = w[R](/^(a(ero|fter|ir|nti|qua|rchi|stro|uto)|back|bio|blood|counter|down|ecto|electro|endo|extra|fore|geo|he(ad|mato|m[io]|tero|xa)|hi(gh|ppo|sto)|ho[lm]o|hy(dro|per|po)|inter|m[ai]cro|me[gt]a|mono|multi|neo|neuro|nitro|o(mni|rtho|steo|ut|ver|xy)|p(ala?eo|ara|enta|hyto|leuro|neumo|oly|ost|roto|seudo|sycho|yro)|radio|semi|socio|super|supra|t(echno|ele|etra|hermo|urbo|urn)|ultra|under|urano|water|zoo|zygo|de|dis|i[lmnr]|non|mis|p?re|sub|un|up)|(ess|ing|ion|ism|ist|nes)?(e?s)?$/g, '')[R](/(e[dr]|ly|ment)$/, '')[R](/([cn])al$/, '$1')[R](/([ai]ble|([ai]bil)?it[iy]|a[el]|i[ac]|ou|[aeiuy])$/, '');
        if (!w[M](/^([^aefijoquvxy][aeiouy]|[fjovy][aeiou]|[aei][abcdglmnprstv]|[bcgkp][hlr]|a[efhikquwxyz]|bs|d[hrw]|e[fioquxy]|f[lr]|gn|io|kn|mc|o[^aehijoquy]|p[nst]|qu|rh|s[chklmnpqtw]|t[hrsw]|u[lmnprst]|w[hr]|x[aeiy])/)
                || w[M](/'|([bfgjkmpqvwxz][qx]|[cdhst]x|[bfjkpqvx]z|[jqv][bfhjpw]|[jq][glmtv]|cj|fv|q[cdeknory]|wj|x[gjk]|yq|z[fj])/)
                || !w[R](/[^aeiouy]/g, '')[L]
                || w.length > 13
                || !B.t(w)
                ) {
            return false;
        }
        return true;
    }
};