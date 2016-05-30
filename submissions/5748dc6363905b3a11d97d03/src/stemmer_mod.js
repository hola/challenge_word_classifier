/* Snowball JavaScript Library v0.3
 * http://code.google.com/p/urim/
 * http://snowball.tartarus.org/
 * Copyright 2010, Oleg Mazko
 * http://www.mozilla.org/MPL/
 */
var stem = new Snowball()
function Snowball() {
    function nAA(a) {
        return a.map(e=>new Among(e[0], e[1], e[2]))
    }
    function Among(s, substring_i, result) {
        this.s_size = length(s);
        this.s = s.split('').map(e=>charCodeAt(e,0))
        this.substring_i = substring_i;
        this.result = result
    }
    function SnowballProgram() {
        var current;
        return {
            b: 0,
            k: 0,
            l: 0,
            c: 0,
            lb: 0,
            s_c: function (word) {
                current = word;
                this.c = 0;
                this.l = length(word);
                this.lb = 0;
                this.b = this.c;
                this.k = this.l;
            },
            g_c: function () {
                var result = current;
                current = null;
                return result;
            },
            i_g: function (s, min, max) {
                if (this.c < this.l) {
                    var ch = charCodeAt(current,this.c);
                    if (ch <= max && ch >= min) {
                        ch -= min;
                        if (s[ch >> 3] & (0X1 << (ch & 0X7))) {
                            this.c++;
                            return true;
                        }
                    }
                }
                return false;
            },
            i_g_b: function (s, min, max) {
                if (this.c > this.lb) {
                    var ch = charCodeAt(current,this.c - 1);
                    if (ch <= max && ch >= min) {
                        ch -= min;
                        if (s[ch >> 3] & (0X1 << (ch & 0X7))) {
                            this.c--;
                            return true;
                        }
                    }
                }
                return false;
            },
            o_g: function (s, min, max) {
                if (this.c < this.l) {
                    var ch = charCodeAt(current,this.c);
                    if (ch > max || ch < min) {
                        this.c++;
                        return true;
                    }
                    ch -= min;
                    if (!(s[ch >> 3] & (0X1 << (ch & 0X7)))) {
                        this.c++;
                        return true;
                    }
                }
                return false;
            },
            o_g_b: function (s, min, max) {
                if (this.c > this.lb) {
                    var ch = charCodeAt(current,this.c - 1);
                    if (ch > max || ch < min) {
                        this.c--;
                        return true;
                    }
                    ch -= min;
                    if (!(s[ch >> 3] & (0X1 << (ch & 0X7)))) {
                        this.c--;
                        return true;
                    }
                }
                return false;
            },
            e_s: function (s_size, s) {
                if (this.l - this.c < s_size)
                    return false;
                for (var i = 0; i < s_size; i++)
                    if (charCodeAt(current,this.c + i) != charCodeAt(s,i))
                        return false;
                this.c += s_size;
                return true;
            },
            e_s_b: function (s_size, s) {
                if (this.c - this.lb < s_size)
                    return false;
                for (var i = 0; i < s_size; i++)
                    if (charCodeAt(current,this.c - s_size + i) != charCodeAt(s,i))
                        return false;
                this.c -= s_size;
                return true;
            },
            f_a: function (v, v_size) {
                var i = 0, j = v_size, c = this.c, l = this.l, common_i = 0, common_j = 0, first_key_inspected = false;
                while (true) {
                    var k = i + ((j - i) >> 1), diff = 0, common = common_i < common_j
                            ? common_i
                            : common_j, w = v[k];
                    for (var i2 = common; i2 < w.s_size; i2++) {
                        if (c + common == l) {
                            diff = -1;
                            break;
                        }
                        diff = charCodeAt(current,c + common) - w.s[i2];
                        if (diff)
                            break;
                        common++;
                    }
                    if (diff < 0) {
                        j = k;
                        common_j = common;
                    } else {
                        i = k;
                        common_i = common;
                    }
                    if (j - i <= 1) {
                        if (i > 0 || j == i || first_key_inspected)
                            break;
                        first_key_inspected = true;
                    }
                }
                while (true) {
                    var w = v[i];
                    if (common_i >= w.s_size) {
                        this.c = c + w.s_size;
                        return w.result
                    }
                    i = w.substring_i;
                    if (i < 0)
                        return 0;
                }
            },
            f_a_b: function (v, v_size) {
                var i = 0, j = v_size, c = this.c, lb = this.lb, common_i = 0, common_j = 0, first_key_inspected = false;
                while (true) {
                    var k = i + ((j - i) >> 1), diff = 0, common = common_i < common_j
                            ? common_i
                            : common_j, w = v[k];
                    for (var i2 = w.s_size - 1 - common; i2 >= 0; i2--) {
                        if (c - common == lb) {
                            diff = -1;
                            break;
                        }
                        diff = charCodeAt(current,c - 1 - common) - w.s[i2];
                        if (diff)
                            break;
                        common++;
                    }
                    if (diff < 0) {
                        j = k;
                        common_j = common;
                    } else {
                        i = k;
                        common_i = common;
                    }
                    if (j - i <= 1) {
                        if (i > 0 || j == i || first_key_inspected)
                            break;
                        first_key_inspected = true;
                    }
                }
                while (true) {
                    var w = v[i];
                    if (common_i >= w.s_size) {
                        this.c = c - w.s_size
                        return w.result
                    }
                    i = w.substring_i;
                    if (i < 0)
                        return 0;
                }
            },
            r_s: function (c_bra, c_ket, s) {
                var adjustment = length(s) - (c_ket - c_bra), left = current
                        .substring(0, c_bra), right = current.substring(c_ket);
                current = left + s + right;
                this.l += adjustment;
                if (this.c >= c_ket)
                    this.c += adjustment;
                else if (this.c > c_bra)
                    this.c = c_bra;
                return adjustment;
            },
            s_f: function (s) {
                this.r_s(this.b, this.k, s);
            },
            s_d: function () {
                this.s_f("");
            },
            i_: function (c_bra, c_ket, s) {
                var adjustment = this.r_s(c_bra, c_ket, s);
                if (c_bra <= this.b)
                    this.b += adjustment;
                if (c_bra <= this.k)
                    this.k += adjustment;
            },
            e_v_b: function (s) {
                return this.e_s_b(length(s), s);
            }
        };
    }
    function stemFactory() {
        var a_0 = nAA([["arsen", -1, -1], ["commun", -1, -1],
            ["gener", -1, -1]]), a_1 = nAA([["'", -1, 1],
            ["'s'", 0, 1], ["'s", -1, 1]]), a_2 = nAA([
            ["ied", -1, 2], ["s", -1, 3],
            ["ies", 1, 2], ["sses", 1, 1],
            ["ss", 1, -1], ["us", 1, -1]]), a_3 = nAA([
            ["", -1, 3], ["bb", 0, 2],
            ["dd", 0, 2], ["ff", 0, 2],
            ["gg", 0, 2], ["bl", 0, 1],
            ["mm", 0, 2], ["nn", 0, 2],
            ["pp", 0, 2], ["rr", 0, 2],
            ["at", 0, 1], ["tt", 0, 2],
            ["iz", 0, 1]]), a_4 = nAA([["ed", -1, 2],
            ["eed", 0, 1], ["ing", -1, 2],
            ["edly", -1, 2], ["eedly", 3, 1],
            ["ingly", -1, 2]]), a_5 = nAA([
            ["anci", -1, 3], ["enci", -1, 2],
            ["ogi", -1, 13], ["li", -1, 16],
            ["bli", 3, 12], ["abli", 4, 4],
            ["alli", 3, 8], ["fulli", 3, 14],
            ["lessli", 3, 15], ["ousli", 3, 10],
            ["entli", 3, 5], ["aliti", -1, 8],
            ["biliti", -1, 12], ["iviti", -1, 11],
            ["tional", -1, 1], ["ational", 14, 7],
            ["alism", -1, 8], ["ation", -1, 7],
            ["ization", 17, 6], ["izer", -1, 6],
            ["ator", -1, 7], ["iveness", -1, 11],
            ["fulness", -1, 9], ["ousness", -1, 10]]), a_6 = nAA([
            ["icate", -1, 4], ["ative", -1, 6],
            ["alize", -1, 3], ["iciti", -1, 4],
            ["ical", -1, 4], ["tional", -1, 1],
            ["ational", 5, 2], ["ful", -1, 5],
            ["ness", -1, 5]]), a_7 = nAA([["ic", -1, 1],
            ["ance", -1, 1], ["ence", -1, 1],
            ["able", -1, 1], ["ible", -1, 1],
            ["ate", -1, 1], ["ive", -1, 1],
            ["ize", -1, 1], ["iti", -1, 1],
            ["al", -1, 1], ["ism", -1, 1],
            ["ion", -1, 2], ["er", -1, 1],
            ["ous", -1, 1], ["ant", -1, 1],
            ["ent", -1, 1], ["ment", 15, 1],
            ["ement", 16, 1]]), a_8 = nAA([["e", -1, 1],
            ["l", -1, 2]]), a_9 = nAA([
            ["succeed", -1, -1], ["proceed", -1, -1],
            ["exceed", -1, -1], ["canning", -1, -1],
            ["inning", -1, -1], ["earring", -1, -1],
            ["herring", -1, -1], ["outing", -1, -1]]), a_10 = nAA([
            ["andes", -1, -1], ["atlas", -1, -1],
            ["bias", -1, -1], ["cosmos", -1, -1],
            ["dying", -1, 3], ["early", -1, 9],
            ["gently", -1, 7], ["howe", -1, -1],
            ["idly", -1, 6], ["lying", -1, 4],
            ["news", -1, -1], ["only", -1, 10],
            ["singly", -1, 11], ["skies", -1, 2],
            ["skis", -1, 1], ["sky", -1, -1],
            ["tying", -1, 5], ["ugly", -1, 8]]), g_v = [
            17, 65, 16, 1], g_v_WXY = [1, 17, 65, 208, 1], g_valid_LI = [
            55, 141, 2], B_Y_found, I_p2, I_p1, habr = [r_Step_1b,
            r_Step_1c, r_Step_2, r_Step_3, r_Step_4, r_Step_5], sbp = new SnowballProgram();
        function r_prelude() {
            var v_1 = sbp.c, v_2;
            B_Y_found = false;
            sbp.b = sbp.c;
            if (sbp.e_s(1, "'")) {
                sbp.k = sbp.c;
                sbp.s_d();
            }
            sbp.c = v_1;
            sbp.b = v_1;
            if (sbp.e_s(1, "y")) {
                sbp.k = sbp.c;
                sbp.s_f("Y");
                B_Y_found = true;
            }
            sbp.c = v_1;
            while (true) {
                v_2 = sbp.c;
                if (sbp.i_g(g_v, 97, 121)) {
                    sbp.b = sbp.c;
                    if (sbp.e_s(1, "y")) {
                        sbp.k = sbp.c;
                        sbp.c = v_2;
                        sbp.s_f("Y");
                        B_Y_found = true;
                        continue;
                    }
                }
                if (v_2 >= sbp.l) {
                    sbp.c = v_1;
                    return;
                }
                sbp.c = v_2 + 1;
            }
        }
        function r_mark_regions() {
            var v_1 = sbp.c;
            I_p1 = sbp.l;
            I_p2 = I_p1;
            if (!sbp.f_a(a_0, 3)) {
                sbp.c = v_1;
                if (habr1()) {
                    sbp.c = v_1;
                    return;
                }
            }
            I_p1 = sbp.c;
            if (!habr1())
                I_p2 = sbp.c;
        }
        function habr1() {
            while (!sbp.i_g(g_v, 97, 121)) {
                if (sbp.c >= sbp.l)
                    return true;
                sbp.c++;
            }
            while (!sbp.o_g(g_v, 97, 121)) {
                if (sbp.c >= sbp.l)
                    return true;
                sbp.c++;
            }
            return false;
        }
        function r_shortv() {
            var v_1 = sbp.l - sbp.c;
            if (!(sbp.o_g_b(g_v_WXY, 89, 121)
                    && sbp.i_g_b(g_v, 97, 121) && sbp.o_g_b(g_v, 97, 121))) {
                sbp.c = sbp.l - v_1;
                if (!sbp.o_g_b(g_v, 97, 121)
                        || !sbp.i_g_b(g_v, 97, 121)
                        || sbp.c > sbp.lb)
                    return false;
            }
            return true;
        }
        function r_R1() {
            return I_p1 <= sbp.c;
        }
        function r_R2() {
            return I_p2 <= sbp.c;
        }
        function r_Step_1a() {
            var a_v, v_1 = sbp.l - sbp.c;
            sbp.k = sbp.c;
            a_v = sbp.f_a_b(a_1, 3);
            if (a_v) {
                sbp.b = sbp.c;
                if (a_v == 1)
                    sbp.s_d();
            } else
                sbp.c = sbp.l - v_1;
            sbp.k = sbp.c;
            a_v = sbp.f_a_b(a_2, 6);
            if (a_v) {
                sbp.b = sbp.c;
                switch (a_v) {
                    case 1 :
                        sbp.s_f("ss");
                        break;
                    case 2 :
                        var c = sbp.c - 2;
                        if (sbp.lb > c || c > sbp.l) {
                            sbp.s_f("ie");
                            break;
                        }
                        sbp.c = c;
                        sbp.s_f("i");
                        break;
                    case 3 :
                        do {
                            if (sbp.c <= sbp.lb)
                                return;
                            sbp.c--;
                        } while (!sbp.i_g_b(g_v, 97, 121));
                        sbp.s_d();
                        break;
                }
            }
        }
        function r_Step_1b() {
            var a_v, v_1, v_3, v_4;
            sbp.k = sbp.c;
            a_v = sbp.f_a_b(a_4, 6);
            if (a_v) {
                sbp.b = sbp.c;
                switch (a_v) {
                    case 1 :
                        if (r_R1())
                            sbp.s_f("ee");
                        break;
                    case 2 :
                        v_1 = sbp.l - sbp.c;
                        while (!sbp.i_g_b(g_v, 97, 121)) {
                            if (sbp.c <= sbp.lb)
                                return;
                            sbp.c--;
                        }
                        sbp.c = sbp.l - v_1;
                        sbp.s_d();
                        v_3 = sbp.l - sbp.c;
                        a_v = sbp.f_a_b(a_3, 13);
                        if (a_v) {
                            sbp.c = sbp.l - v_3;
                            switch (a_v) {
                                case 1 :
                                    var c = sbp.c;
                                    sbp.i_(sbp.c, sbp.c, "e");
                                    sbp.c = c;
                                    break;
                                case 2 :
                                    sbp.k = sbp.c;
                                    if (sbp.c > sbp.lb) {
                                        sbp.c--;
                                        sbp.b = sbp.c;
                                        sbp.s_d();
                                    }
                                    break;
                                case 3 :
                                    if (sbp.c == I_p1) {
                                        v_4 = sbp.l - sbp.c;
                                        if (r_shortv()) {
                                            sbp.c = sbp.l - v_4;
                                            var c = sbp.c;
                                            sbp.i_(sbp.c, sbp.c, "e");
                                            sbp.c = c;
                                        }
                                    }
                                    break;
                            }
                        }
                        break;
                }
            }
        }
        function r_Step_1c() {
            var v_1 = sbp.l - sbp.c;
            sbp.k = sbp.c;
            if (!sbp.e_s_b(1, "y")) {
                sbp.c = sbp.l - v_1;
                if (!sbp.e_s_b(1, "Y"))
                    return;
            }
            sbp.b = sbp.c;
            if (sbp.o_g_b(g_v, 97, 121) && sbp.c > sbp.lb)
                sbp.s_f("i");
        }
        function r_Step_2() {
            var a_v;
            sbp.k = sbp.c;
            a_v = sbp.f_a_b(a_5, 24);
            if (a_v) {
                sbp.b = sbp.c;
                if (r_R1()) {
                    switch (a_v) {
                        case 1 :
                            sbp.s_f("tion");
                            break;
                        case 2 :
                            sbp.s_f("ence");
                            break;
                        case 3 :
                            sbp.s_f("ance");
                            break;
                        case 4 :
                            sbp.s_f("able");
                            break;
                        case 5 :
                            sbp.s_f("ent");
                            break;
                        case 6 :
                            sbp.s_f("ize");
                            break;
                        case 7 :
                            sbp.s_f("ate");
                            break;
                        case 8 :
                            sbp.s_f("al");
                            break;
                        case 9 :
                            sbp.s_f("ful");
                            break;
                        case 10 :
                            sbp.s_f("ous");
                            break;
                        case 11 :
                            sbp.s_f("ive");
                            break;
                        case 12 :
                            sbp.s_f("ble");
                            break;
                        case 13 :
                            if (sbp.e_s_b(1, "l"))
                                sbp.s_f("og");
                            break;
                        case 14 :
                            sbp.s_f("ful");
                            break;
                        case 15 :
                            sbp.s_f("less");
                            break;
                        case 16 :
                            if (sbp.i_g_b(g_valid_LI, 99, 116))
                                sbp.s_d();
                            break;
                    }
                }
            }
        }
        function r_Step_3() {
            var a_v;
            sbp.k = sbp.c;
            a_v = sbp.f_a_b(a_6, 9);
            if (a_v) {
                sbp.b = sbp.c;
                if (r_R1()) {
                    switch (a_v) {
                        case 1 :
                            sbp.s_f("tion");
                            break;
                        case 2 :
                            sbp.s_f("ate");
                            break;
                        case 3 :
                            sbp.s_f("al");
                            break;
                        case 4 :
                            sbp.s_f("ic");
                            break;
                        case 5 :
                            sbp.s_d();
                            break;
                        case 6 :
                            if (r_R2())
                                sbp.s_d();
                            break;
                    }
                }
            }
        }
        function r_Step_4() {
            var a_v, v_1;
            sbp.k = sbp.c;
            a_v = sbp.f_a_b(a_7, 18);
            if (a_v) {
                sbp.b = sbp.c;
                if (r_R2()) {
                    switch (a_v) {
                        case 1 :
                            sbp.s_d();
                            break;
                        case 2 :
                            v_1 = sbp.l - sbp.c;
                            if (!sbp.e_s_b(1, "s")) {
                                sbp.c = sbp.l - v_1;
                                if (!sbp.e_s_b(1, "t"))
                                    return;
                            }
                            sbp.s_d();
                            break;
                    }
                }
            }
        }
        function r_Step_5() {
            var a_v, v_1;
            sbp.k = sbp.c;
            a_v = sbp.f_a_b(a_8, 2);
            if (a_v) {
                sbp.b = sbp.c;
                switch (a_v) {
                    case 1 :
                        v_1 = sbp.l - sbp.c;
                        if (!r_R2()) {
                            sbp.c = sbp.l - v_1;
                            if (!r_R1() || r_shortv())
                                return;
                            sbp.c = sbp.l - v_1;
                        }
                        sbp.s_d();
                        break;
                    case 2 :
                        if (!r_R2() || !sbp.e_s_b(1, "l"))
                            return;
                        sbp.s_d();
                        break;
                }
            }
        }
        function r_exception2() {
            sbp.k = sbp.c;
            if (sbp.f_a_b(a_9, 8)) {
                sbp.b = sbp.c;
                return sbp.c <= sbp.lb;
            }
            return false;
        }
        function r_exception1() {
            var a_v;
            sbp.b = sbp.c;
            a_v = sbp.f_a(a_10, 18);
            if (a_v) {
                sbp.k = sbp.c;
                if (sbp.c >= sbp.l) {
                    switch (a_v) {
                        case 1 :
                            sbp.s_f("ski");
                            break;
                        case 2 :
                            sbp.s_f("sky");
                            break;
                        case 3 :
                            sbp.s_f("die");
                            break;
                        case 4 :
                            sbp.s_f("lie");
                            break;
                        case 5 :
                            sbp.s_f("tie");
                            break;
                        case 6 :
                            sbp.s_f("idl");
                            break;
                        case 7 :
                            sbp.s_f("gentl");
                            break;
                        case 8 :
                            sbp.s_f("ugli");
                            break;
                        case 9 :
                            sbp.s_f("earli");
                            break;
                        case 10 :
                            sbp.s_f("onli");
                            break;
                        case 11 :
                            sbp.s_f("singl");
                            break;
                    }
                    return true;
                }
            }
            return false;
        }
        function r_postlude() {
            var v_1;
            if (B_Y_found) {
                while (true) {
                    v_1 = sbp.c;
                    sbp.b = v_1;
                    if (sbp.e_s(1, "Y")) {
                        sbp.k = sbp.c;
                        sbp.c = v_1;
                        sbp.s_f("y");
                        continue;
                    }
                    sbp.c = v_1;
                    if (sbp.c >= sbp.l)
                        return;
                    sbp.c++;
                }
            }
        }

        this.of = function (word) {
            sbp.s_c(word);
            var v_1 = sbp.c;
            if (!r_exception1()) {
                sbp.c = v_1;
                var c = sbp.c + 3;
                if (0 <= c && c <= sbp.l) {
                    sbp.c = v_1;
                    r_prelude();
                    sbp.c = v_1;
                    r_mark_regions();
                    sbp.lb = v_1;
                    sbp.c = sbp.l;
                    r_Step_1a();
                    sbp.c = sbp.l;
                    if (!r_exception2())
                        for (var i = 0; i < length(habr); i++) {
                            sbp.c = sbp.l;
                            habr[i]();
                        }
                    sbp.c = sbp.lb;
                    r_postlude();
                }
            }
            return sbp.g_c().replace(/^un/g,'');
        }
    }
    return new stemFactory();
}