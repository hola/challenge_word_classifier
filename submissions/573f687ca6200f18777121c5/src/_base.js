var rH = {};
var b;
var min, max;

function Hash(seed)
{
    return function (string) {
        var result = 1;
        for (var i = 0; i < string.length; ++i)
            result = (seed * result + string.charCodeAt(i)) & 0xFFFFFFFF;
        return result;

    };
}

function Bloom(data, size, f) {
    var bits = function(index)
    {
        return (-data[Math.abs(Math.floor(index / 32))] >>> (index % 32)) & 1;
    };
    return function test(string)
    {
        for (var i = 0; i < f.length; ++i)
            if (!bits(f[i](string) % size)) {
                return false;
            }
        return true;
    }
}


var _init = function(data) {
    var stringToArrayBuffer = function (string) {
        function StringToBinary(string) {
            var chars, code, i, isUCS2, len, _i;

            len = string.length;
            chars = [];
            isUCS2 = false;
            for (i = _i = 0; 0 <= len ? _i < len : _i > len; i = 0 <= len ? ++_i : --_i) {
                code = String.prototype.charCodeAt.call(string, i);
                if (code > 255) {
                    isUCS2 = true;
                    chars = null;
                    break;
                } else {
                    chars.push(code);
                }
            }
            if (isUCS2 === true) {
                return unescape(encodeURIComponent(string));
            } else {
                return String.fromCharCode.apply(null, Array.prototype.slice.apply(chars));
            }
        }
        function StringToUint8Array(string) {
            var binary, binLen, buffer, chars, i, _i;
            binary = StringToBinary(string);
            binLen = binary.length;
            buffer = new ArrayBuffer(binLen);
            chars  = new Uint8Array(buffer);
            for (i = _i = 0; 0 <= binLen ? _i < binLen : _i > binLen; i = 0 <= binLen ? ++_i : --_i) {
                chars[i] = String.prototype.charCodeAt.call(binary, i);
            }
            return chars;
        }
        return StringToUint8Array(string).buffer;
    };

    var walkerUnCompressHash = function(hash, char) {
        if (typeof hash !== 'string') {
            if ((char in hash) && (typeof hash[char] === 'string'))  {
                var value = hash[char];
                var isComplex = value.indexOf('!') > -1;
                var splitChar = isComplex ? '!' : '';
                var array = value.split(splitChar);
                if (isComplex) {
                    var length = array.length;
                    for (var i = 0; i < length - 1; i++) {
                        hash[array[i]] = char;
                    }
                    if (length - 1 >= 0) {
                        array = array[length - 1].split('');
                        for (var i = 0; i < array.length; i++) {
                            hash[array[i]] = char;
                        }
                    }
                } else {
                    for (var i = 0; i < array.length; i++) {
                        hash[array[i]] = char;
                    }
                }

                delete hash[char];
            }
            for (var key in hash) {
                walkerUnCompressHash(hash[key], char.toString());
            }
        }
    };
    var hash = JSON.parse(data[1]
        .toString()
        .replace(/A/g, "$,':")
        .replace(/B/g, "{$,")
        .replace(/(%%.*)?([\d]+)/g, function($0, $1, $2){
            return $1?$1+$2:'"'+$2+'":';
        })
        .replace(/([a-z'$!]+)%/g, '$1:%')
        .replace(/%([a-z'$!]+)/g, '%:$1')
        .replace(/}([a-z'%$!]+)/g, '},$1')
        .replace(/([a-z'%$!]+){/g, '$1:{')
        .replace(/([a-z'%$!]+):/g, '"$1":')
        .replace(/:([a-z'%$!]+)/g, ':"$1"')
        .replace(/{([a-z'%$!]+),/g, '{"$1":{},')
        .replace(/,([a-z'%$!]+)}/g, ',"$1":{}}')
        .replace(/,([a-z'%$!]+),/g, ',"$1":{},')
        .replace(/,([a-z'%$!]+),/g, ',"$1":{},')
        .replace(/([a-z'%$!]+){/g, '"$1":{')
        .replace(/{([a-z'%$!]+})/g, '{"$1":{}}')
        .replace(/,,/g, ',null,')
    );

    var f = [];
    for (var i = 0; i < hash['%%']['seeds'].length; i ++) {
        f[i] = Hash(hash['%%']['seeds'][i]);
    }

    b = Bloom(new Int32Array(stringToArrayBuffer(data[2])), hash['%%'].size, f);
    min = hash['%%'].min;
    max = hash['%%'].max;
    delete hash['%%'];

    for (var i = 0; i <= 9; i ++) {
        walkerUnCompressHash(hash, i);
    }
    walkerUnCompressHash(hash, '%');
    rH = hash;

};

var _test = function(word) {
    var wordLength = word.length;
    if ((wordLength > min) && (wordLength < max)) {
        if (!b(word)) return false;
    }
    var hash = rH;
    var i = 0;


    while (i < wordLength) {
        var found = false;
        for (var j = i + 1; j <= wordLength; j ++) {
            var subWord = word.substring(i, j);

            if (subWord in hash) {
                found = true;
                hash = hash[subWord];
                if (typeof hash === 'string') {
                    if (hash === word.substring(j)) {
                        return true;
                    } else if (hash === '%') {
                        if (j === wordLength) {
                            return true;
                        } else {
                            hash = rH['%'];
                        }
                    }
                    else if (hash.match(/\d+/) && ((wordLength - j <= parseInt(hash, 10)) || (hash === '9')) && ((wordLength - j) / wordLength * 100 < 50)) {
                        return true;
                    } else {
                        return false;
                    }
                } else {
                    if (((Object.keys(hash).length === 0) || ('$' in hash)) && (j == wordLength)) {
                        return true;
                    }
                }
                i = j;
                break;
            }

        }
        if (!found) {
            break;
        }
    }
    return false;
};
