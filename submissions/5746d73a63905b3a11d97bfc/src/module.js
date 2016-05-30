
var arr;
var arrSizeInBits;

function isBitSet(pos) {
    var idx = (pos / 8) | 0;
    var offset = pos % 8;
    var b = 1 << offset;
    return (arr[idx] & b) != 0;
}

function hash1(s) {
    var hash = 0;
    if (s.length == 0) return hash;

    for (var i in s) {
        var ch = s.charCodeAt(i);
        if (ch != 39)
            ch -= 95;
        else ch = 1;

        hash = hash * 47 + ch;
        hash = hash & hash; // Convert to 32bit integer
    }

    return hash;
}

function contains(item) {

    var resultingHash = (hash1(item)) % arrSizeInBits;
    var hash = resultingHash > 0 ? resultingHash : -resultingHash;

    if (!isBitSet(hash))
        return false;

    return true;
}

function toInt(arr, pos) {
    var res = 0;

    for (var i = 0; i < 4; i++)
        res += (arr[pos + i] << (i * 8));

    return res;
}

function unpack(arr, idx) {
    var index = 0;
    var pos = 0;
    var res = [];

    while (index <= idx) {
        var len = toInt(arr, pos); pos += 4;
        if (index == idx) {
            res = new Array();
            for (var i = 0; i < len; i++) {
                res.push(arr[pos + i]);
            }
            break;
        }

        pos += len;
        index++;
    }

    return res;
}

function splitString(buf) {
    var s = '';
    var res = {};

    for (var i in buf)
        s += String.fromCharCode(buf[i]);
    s.split('\r\n').forEach(function (e) {
        if (!!e)
            res[e] = true;
    });

    return res;
}

var exc2w;
var ends
var starts;
var maxLength;

function  wordStatus(word) {
            var res = {
                baseWord: word,
                status: 0
            };

            // check word length
            if (!word) return res;

            // check max length
            if (word.length > maxLength)
                return res;

            // check one word
            if (word.length == 1) {
                if (word[0] >= 'a' && word[0] <= 'z') {
                    res.status = 1;
                    return res;
                }
                else
                    return res;
            }

            // check two words exceptions
            if (word.length == 2) {
                res.status = exc2w[word] == null ? 1 : 0;
                return res;
            }

            // check starts
            var s = word.substring(0, 2);
            if (starts[s] == null)
                return res;

            // check endings
            var lst = [];

            for (var i = 1; i < (word.length - 1) ; i++) {
                s = word.substring(i);
                var bs = word.substring(0, i);
                if (ends[s]) {
                    lst.push({ key: bs, value: ends[s] });
                }

            }

            if (lst.length > 0) {
                var item = lst[0];

                for (var i = 1; i < lst.length; i++) {
                    if (lst[i].value > item.value)
                        item = lst[i];
                }

                res.baseWord = item.key;
            }

            res.status = 2;
            return res;
        }

exports.init = function (data) {
    // load 
    maxLength = toInt(unpack(data, 0), 0);
    arrSizeInBits = toInt(unpack(data, 0), 4);
    arr = unpack(data, 1);

    exc2w = splitString(unpack(data, 2));
    ends = splitString(unpack(data, 3));
    starts = splitString(unpack(data, 4));
}

exports.test = function (word) {
    var isWord = false;
    var s = word.toLowerCase().trim();
    var sf = wordStatus(s);

    if (sf.status == 0) isWord = false;
    else if (sf.status == 1) isWord = true;
    else
        isWord = contains(sf.baseWord);

    return isWord;
}
