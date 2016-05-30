var soundex = [];
var max = 6;
var deleteRangeLetters = function (rangeStr) {
    var arr = rangeStr.split("");
    var returnRange = function (start, end) {
        var str = '';

        for (var i = start.charCodeAt() + 1; i < end.charCodeAt(); i++) {
            str += String.fromCharCode(i);
        }

        return str;
    };

    return arr.map(function (s, i) {
        if (arr[i - 1] && arr[i + 1] && s === '-') {
            return returnRange(arr[i - 1], arr[i + 1]);
        } else {
            return s;
        }
    }).join("");
};

var Soundex = function (str) {

    var arr = [
        'ation',
        'less', 'ness', 'able', 'ment',
        'ing', 'ion', 'ive', 'ful', 'ble', 'pot', 'ies', 'ous', 'hip', 'non', 'pre',
        'or', 'es', 'ed', 'er', 'en', 'al', 'an', 'ae', 'ce', 'ne', 'nu', 'ng', 'ch', 'co',
        'ie', 'ly', 'la', 'is', 'it', 'ic', 'in', 'id', 'le', 'on', 'st', 'us', 'um', 'un', 'te', 've',
        "'s", 'a', 'd', 's', 'y', 'e'
    ];

    var isClearStr = true;

    var clearStr = function () {
        isClearStr = true;
        arr.forEach(function (item) {
            var strR = str.replace(new RegExp(item + '$'), '');

            if (strR !== str) {
                isClearStr = false;
                str = strR;
            }
        });

        if (!isClearStr) {
            clearStr();
        }
    };

    clearStr();

    var split = String(str).toUpperCase().replace(/[^A-Z]/g, '').split(''),
        map = {BP: 1, FV: 2, CKS: 3, GJ: 4, QXZ: 5, DT: 6, L: 7, MN: 8, R: 9},
        keys = Object.keys(map).reverse();
    var build = split.map(function (letter) {
        for (var num in keys) {
            if (keys[num].indexOf(letter) != -1) {
                return map[keys[num]];
            }
        }
    });

    var first = build.splice(0, 1)[0];
    build = build.filter(function (num, index, array) {
        return ((index === 0) ? num !== first : num !== array[index - 1]);
    });

    return split[0] + (build.join('') + (new Array(max + 1).join('0'))).slice(0, max);
};

module.exports = {
    init: function (data) {
        var soundexEncode = JSON.parse(data.toString('utf8'));
        var diffIndex = 0;

        soundexEncode.forEach(function (item, index) {
            if (typeof(item) === "string") {
                deleteRangeLetters(item).split("").forEach(function (i) {
                    var n = Number(index + diffIndex);

                    soundex.push(i + ('000000' + n).slice((n + '').length));
                });
            } else {
                diffIndex += item - 1;
            }
        });
    },

    test: function (word) {
        var newMask = Soundex(word);
        var res = false;

        soundex.forEach(function (wordMask) {
            if (wordMask === newMask) {
                res = true;
            }
        });

        return res;
    },

    encode: function (word) {
        return Soundex(word);
    }
};