"use strict";

this.translate = function (wd0) {
    var rez = '';
    var wd = wd0.toString();
    if (wd.toString().endsWith("'s")) {
        wd = wd.substring(0, wd.length - 2) + "$";
    }
    if ((wd.length > 16) || (wd.length < 5)) {
//        console.log(" .translate(" + wd0 + ") -> WRONG LENGTH " + wd.length);
        return '';
    }

    for (var i = 0; i < (wd.length - 3); i++) {
        var a = wd[i];
        var n = this.alfa_pos[i].indexOf(a);
        if (n < 0) {
//            console.log(" .translate(" + wd0 + ") -> WRONG ALFA at pos " + i);
            return '';
        }
        rez += a;
    }

    for (var i = 3; i > 0; i--) {
        var a = wd[wd.length - i];
        var n = this.alfa_pos[-i].indexOf(a);
        if (n < 0) {
//            console.log(" .translate(" + wd0 + ") -> WRONG ALFA at pos " + (-i));
            return '';
        }
        rez += a;
    }

//    console.log(" .translate(" + wd0 + ") -> " + rez);
    return rez;

};


this.triplet_pos = [0, 2, -3];


module.exports.init = function (data) {
//    console.log("length = " + data.length);
    var buff = Buffer.from(data);

    // Слова исключения, длинной 26 и более
    var cur = 0;
    var curr_start = cur;
    for (; cur < data.length; cur++) {
        var a = data[cur];
        if (a === 0)
            break;
    }
    this.all_words = data.toString('ascii', curr_start, cur).split('\t');

//    console.log(" this.all_words = "+this.all_words.length);
    //console.log(this.all_words);

    // допустимые буквы для каждой позиции 
    cur += 1;
    var curr_start = cur;
    for (; cur < data.length; cur++) {
        var a = data[cur];
        if (a === 0)
            break;
    }
    var s = data.toString('ascii', curr_start, cur).split('\n');
    //console.log(">>> s = ");
    //console.log(s);
    this.alfa_pos = {}; // HashMap ?
    for (var i = -3; i <= 12; i++) {
        this.alfa_pos[i] = s[i + 3];
    }
    var alfa_pos = this.alfa_pos; // проблемы с обл. видимости ?
//    console.log(">>> alfa_pos = " + this.alfa_pos.length);
//    console.log(this.alfa_pos);

    // всппомогательные функц - считать массив бит
    cur += 1;
    function bits_load() {
        var rez = [];
        var n = buff.readUInt32LE(cur);
        cur += 4; // next
//        console.log(">>> load_bits / size = " + n);

        for (var i = 0; i < n; i++) {
            rez.push(buff.readUInt32LE(cur));
            cur += 4; // next
        }

        return rez;
    }
    // проверить отдельный бит в массиве 
    function bits_test(bits, b) {
        return !((bits[Math.floor(b / 32)] & (1 << (b % 32))) === 0);
    }
    // сформировать набор допустимых значений
    function get_full_range(pos) {
        var rez = [];
//        console.log("   full_range("+pos+"): "+alfa_pos[pos]);
        var pos1 = parseInt(pos) + 1;
//        console.log("   full_range("+pos1+"): "+alfa_pos[pos1]);
        var pos2 = parseInt(pos) + 2;
//        console.log("   full_range("+pos2+"): "+alfa_pos[pos2]);
        for (var a1 in alfa_pos[pos]) {
            for (var a2 in alfa_pos[pos1]) {
                for (var a3 in alfa_pos[pos2]) {
                    rez.push(alfa_pos[pos][a1] + alfa_pos[pos1][a2] + alfa_pos[pos2][a3]);
                }
            }
        }
//        console.log("    .get_full_range(" + pos + ") : " + rez.length);
        //console.log(rez);
        return rez;
    }

    // считываем запретные триплеты
    var anti_by_pos = {};
    for (var idx in this.triplet_pos) {
        var pos = this.triplet_pos[idx];
//        console.log(" = anti_by_pos[" + pos+"] ");
        anti_by_pos[pos] = [];
        var full_range = get_full_range(pos);
        var bits = bits_load();
        for (var idx in full_range) {
            var aa = full_range[idx];
            var n = full_range.indexOf(aa);
            if (n > -1) {
                if (bits_test(bits, n)) {
                    anti_by_pos[pos].push(aa);
                }
            }
        }
//        console.log(" .anti_by_posх[" + pos + "] : " + anti_by_pos[pos].length);
        //console.log(anti_by_pos[pos]);
    }
    // считываем допустимые триплеты ( и сразу вычитаем из них запретные )
    this.dict_by_len_pos = {};
    for (var LL = 5; LL < 17; LL++) {
        var parts_by_pos = {};
        for (var idx in this.triplet_pos) {
            var pos = this.triplet_pos[idx];
            parts_by_pos[pos] = [];

            // full range without anti triplets
            var full_range = get_full_range(pos);
            for (var idx in anti_by_pos[pos]) {
                var aa = anti_by_pos[pos][idx];

                var x = full_range.indexOf(aa);
                full_range.splice(x, 1); // remove one elem
            }

            var bits = bits_load();
            for (var idx in full_range) {
                var aa = full_range[idx];

                var x = full_range.indexOf(aa);
                if (bits_test(bits, x)) {
                    parts_by_pos[pos].push(aa);
                }
            }
//            console.log("dict_by_len_pos[len:" + LL + " pos:" + pos + " ]: " + parts_by_pos[pos].length);
        }
        this.dict_by_len_pos[LL] = parts_by_pos;
    }

    // остаток - блюм
    var n = buff.readUInt8(cur); // кол-во функций. тут - 1
    cur += 1;

    for (; n > 0; n--) {
        // сиды к ниму не нужны, у нас будет CRC32
        cur += 2;
    }

    this.blm_bits = bits_load();

    function makeCRCTable() {
        var c;
        var crcTable = [];
        for (var n = 0; n < 256; n++) {
            c = n;
            for (var k = 0; k < 8; k++) {
                c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
            }
            crcTable[n] = c;
        }
        return crcTable;
    }
    this.crc32_tbl = makeCRCTable();

};


module.exports.test = function (word) {
    var wd = word.toLowerCase().trim();

    if (wd.length === 1) {
        return wd !== "'";
    }

    // Слова исключения, длинной 26 и более
    if (wd.length >= 26) {
//        console.log(">>> test: all_words!");
        return this.all_words.includes(wd);
    }

    // проверка по допкстимому алфавиту
    wd = this.translate(wd);
    if (wd === '') {
//        console.log(">>> test: translate()! ");
        return false;
    }

    for (var i in this.triplet_pos) {
        var pos = this.triplet_pos[i];
        var triplets = this.dict_by_len_pos[wd.length][pos];
        var pp = pos;
        if (pp < 0) {
            pp += wd.length;
        }
        var aa = wd.substring(pp, pp + 3);
        if (aa.length === 3) {
            var x = triplets.indexOf(aa);
            if (x === -1) {
//                console.log(">>> test: dict_by_len_pos(len:" + wd.length + " pos:" + pos + " )! " + aa);
                return false;
            }
        }
    }

    var crcTable = this.crc32_tbl;
    function crc32(str) {
        var crc = 0 ^ (-1);

        for (var i = 0; i < str.length; i++) {
            crc = (crc >>> 8) ^ crcTable[(crc ^ str.charCodeAt(i)) & 0xFF];
        }

        return (crc ^ (-1)) >>> 0;
    }
    var n = crc32(wd);
//    console.log("CRC32( " + wd + " ): " + n);
    var b = n % (8*1024*35);
    if ((this.blm_bits[Math.floor(b / 32)] & (1 << (b % 32))) === 0) {
//        console.log(">>> test: BLOOM");
        return false;
    }


    return true;
};