var calculateHash = function(startPosition, line, resultHash) {
    var hash = resultHash;
    for (var i = 0; i <= startPosition; i ++) {
        if (line[i] in hash) {
            hash = hash[line[i]];
        } else {
            hash[line[i]] = {};
            hash = hash[line[i]];
        }
    }
};

var calculateHashs = function(lines, resultHash) {
    for (var i = 0; i < lines.length; i ++) {
        var line = lines[i]  + "$";
        for (var k = 0; k < line.length; k ++) {
            calculateHash(k, line, resultHash)
        }
    }
};

var hashLength = function(hash) {
    return Object.keys(hash).length;
};

var walkerJoinHash = function(hash, stack, word) {
    if (!stack) {
        stack = [];
    }
    if (!word) {
        word = '';
    }

    for (var key in hash) {
        walkerJoinHash(hash[key], stack.concat([hash]), word + key);
    }

    if (hashLength(hash) === 0) {
        var from = null;
        for (var i = stack.length - 1; i >= 0  ; i --) {
            var group = stack[i];
            if (hashLength(group) <= 1 ) {
                if (from === null) {
                    from = i;
                }
            } else {
                if (from !== null) {
                    if (from === stack.length - 1) {
                        var subLine = word.substring(i + 1, from + 1);
                        group[word[i]] = subLine;
                    } else {
                        var subLine = word[i] + word.substring(i + 1, from + 1);
                        group[subLine] = stack[from + 1];
                        delete group[word[i]];
                    }
                }
                from = null;
            }
        }
    }
};



var walkerSpecialRemoverHash = function(hash) {
    for (var key in hash) {
        var newHash = hash[key];
        if (typeof newHash === 'string') {
            if (newHash === '$') {
                hash[key] = {}
            } else {
                if (newHash.match(/\$/)) {
                    var newValue = newHash.replace(/\$/, '');
                    hash[key] = newValue;
                }
            }
        } else {
            if (hashLength(newHash) === 0) {
                if (key !== '$') {
                    if (key.match(/\$/)) {
                        var newKey = key.replace(/\$/, '');
                        hash[newKey] = hash[key];
                        delete hash[key];
                    }
                }
            } else {
                walkerSpecialRemoverHash(newHash);
            }
        }
    }
};

var walkerDeepHash = function(hash, deep) {
    delete hash['#'];
    var result = deep;
    for (var key in hash) {
        var tempDeep;
        if (typeof hash[key] !== 'string') {
            tempDeep = walkerDeepHash(hash[key], deep + key.length);
        } else {
            tempDeep = deep + hash[key].length;
        }
        if (tempDeep >= result) {
            result = tempDeep;
        }
    }
    if (result > 9) {
        result = 9;
    }
    return result;
};

var walkerDeepFillingHash = function(hash, tailArray, coefficient) {
    delete hash['#'];
    for (var key in hash) {
        if (typeof hash[key] !== 'string') {
            if (hash[key]['#'] <= coefficient) {
                var tempHash = hash[key];
                hash[key] = walkerDeepHash(tempHash, 0);
                tailArray.push(tempHash);
            } else {
                walkerDeepFillingHash(hash[key], tailArray, coefficient);
            }
        }
    }
};

var walkerFillingHash = function(hash, tailArray, coefficient, char) {
    delete hash['#'];
    for (var key in hash) {
        if (typeof hash[key] !== 'string') {
            if (hash[key]['#'] <= coefficient) {
                var tempHash = hash[key];
                hash[key] = char;
                tailArray.push(tempHash);
            } else {
                walkerFillingHash(hash[key], tailArray, coefficient, char);
            }
        }
    }
};

var walkerCompressHash = function(hash, char) {
    if (typeof hash !== 'string') {
        var array1 = [];
        var array2 = [];
        var isComplex = false;
        for (var key in hash) {
            if (hash[key] === char) {
                if (key.length > 1) {
                    isComplex = true
                }

                if (key.length === 1) {
                    array1.push(key);
                } else {
                    array2.push(key);
                }

            }
        }

        var charValue1 = array1.sort().join('');
        var charValue2 = array2.sort().join('!') + '!';
        var charValue = '';

        if (isComplex) {
            charValue = charValue2 + charValue1;
        } else {
            charValue = charValue1;
        }

        if (charValue !== '') {
            hash[char] = charValue;
        }

        for (var i = 0; i < array1.length; i++) {
            delete hash[array1[i]];
        }

        for (var i = 0; i < array2.length; i++) {
            delete hash[array2[i]];
        }

        for (var key in hash) {
            walkerCompressHash(hash[key], char)
        }
    }
};

var uniqPush = function (hash, element) {
    if (element === '') return;
    hash[element] = '';
};

var walkerTailArrayToLinesArray = function(hash, lines, word) {
    if (!word) {
        word = '';
    }
    if (typeof hash !== 'string') {
        delete hash['#'];
        for (var key in hash) {
            walkerTailArrayToLinesArray(hash[key], lines, word + key);
        }
        if (hashLength(hash) === 0) {
            uniqPush(lines, word.replace(/\$/, ''));
        }
    } else {
        uniqPush(lines, (word + hash).replace(/\$/, ''));
    }
};

var setWeight = function(hash, value) {
    if ('#' in hash) {
        hash['#'] += value;
    } else {
        hash['#'] = value;
    }
};



var weightWord = function(word, resultHash) {
    var hash = resultHash;
    var i = 0;
    while (i < word.length) {
        var found = false;
        for (var j = i + 1; j <= word.length; j ++) {
            var subWord = word.substring(i, j);

            if (subWord in hash) {
                found = true;
                setWeight(hash,  1.0 / j);
                hash = hash[subWord];
                if (typeof hash === 'string') {
                    if (hash === word.substring(j)) {
                        return;
                    } else {
                        return;
                    }
                } else {
                    if (((Object.keys(hash).length === 0) || ('$' in hash)) && (j == word.length)) {
                        return;
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
};

var weightHash = function(lines, resultHash) {
    for (var l = 0; l < lines.length; l ++) {
        weightWord(lines[l], resultHash);
    }
};

var generateResultHash = function(resultHash, lines, k1, k2) {
    calculateHashs(lines, resultHash);
    walkerJoinHash(resultHash);
    walkerSpecialRemoverHash(resultHash);
    weightHash(lines, resultHash);
    var tailArray = [];

    walkerFillingHash(resultHash, tailArray, k1, '%');//50
    var tailLines = {};
    for (var i = 0; i < tailArray.length; i ++) {
        var tail = tailArray[i];
        walkerTailArrayToLinesArray(tail, tailLines);
    }
    tailLines = Object.keys(tailLines);
    var tailHash = {};
    calculateHashs(tailLines, tailHash);
    walkerJoinHash(tailHash);
    walkerSpecialRemoverHash(tailHash);
    weightHash(tailLines, tailHash);
    var tailArray = [];
    walkerDeepFillingHash(tailHash, tailArray, k2);//50
    resultHash['%'] = tailHash;

    var tailLines = {};
    for (var i = 0; i < tailArray.length; i ++) {
        var tail = tailArray[i];
        walkerTailArrayToLinesArray(tail, tailLines);
    }

    walkerCompressHash(resultHash, '%');
    for (var i = 0; i <= 9; i++) {
        walkerCompressHash(resultHash, i);
    }
};

var readFile = function() {
    var fs = require('fs');
    var util = require('util');
    var bloom = require('./bloom');
    fs.readFile( __dirname + '/words.txt', function (err, data) {

        if (err) {
            throw err;
        }
        var tempLines = data.toString().split("\n");
        var lines = {};

        for (var i = 0; i < tempLines.length; i ++) {
            var line = tempLines[i];
            lines[line.toLowerCase()] = '';
        }
        lines = Object.keys(lines);

        var resultHash = {};
        generateResultHash(resultHash, lines, 50, 50);


        var minLength = 3;
        var maxLength = 14;
        var longestLines = lines.filter(function(element) {
            return (element.length > minLength) && (element.length < maxLength);
        });


        var b = bloom(0.765, longestLines, minLength, maxLength);
        resultHash['%%'] = b[0];

        fs.readFile( __dirname + '/_base.min.js', function (err, base) {
            if (err) {
                throw err;
            }
            writeFile(resultHash, b[2], base);
        });

    });
};


var arrayBufferToString = function (buffer) {
    function BinaryToString(binary) {
        var error;
        try {
            return decodeURIComponent(escape(binary));
        } catch (_error) {
            error = _error;
            if (error instanceof URIError) {
                return binary;
            } else {
                throw error;
            }
        }
    }
    return BinaryToString(String.fromCharCode.apply(null, Array.prototype.slice.apply(new Uint8Array(buffer))));
};

var writeFile = function(resultHash, bloom, base) {

    var fs = require('fs');
    var util = require('util');
    var zlib = require('zlib');
    var result = base + '~~' +
        JSON.stringify(resultHash)
            .replace(/\\/g, '')
            .replace(/"\s"/g, '')
            .replace(/"([a-z'%*$!\d]+)":/g, '$1:')
            .replace(/:"([a-z'%*$!\d]+)"/g, ':$1')
            .replace(/:\{}/g, '')
            .replace(/([a-z'%*$!\d]+):{/g, '$1{')
            .replace(/},([a-z'%*$!\d]+)/g, '}$1')
            .replace(/([a-z'$!\d]+):%/g, '$1%')
            .replace(/%:([a-z'$!\d]+)/g, '%$1')
            .replace(/([a-z'$!\d]+):\*/g, '$1*')
            .replace(/\*:([a-z'$!\d]+)/g, '*$1')
            .replace(/([\d]+):/g, '$1')
            .replace(/\$,':/g, 'A')
            .replace(/\{\$,/g, 'B')
            .replace(/null/g, '')
        + '~~' + arrayBufferToString((new Int32Array(bloom)).buffer);

    var gzip = zlib.createGzip({
        level: zlib.Z_BEST_COMPRESSION
    }), buffers = [], nread = 0;

    gzip.on('error', function(err) {
        gzip.removeAllListeners();
        gzip = null;
    });

    gzip.on('data', function(chunk) {
        buffers.push(chunk);
        nread += chunk.length;
    });


    gzip.on('end', function() {
        var buffer;
        switch (buffers.length) {
            case 0:
                buffer = new Buffer(0);
                break;
            case 1:
                buffer = buffers[0];
                break;
            default:
                buffer = new Buffer(nread);
                var n = 0;
                buffers.forEach(function(b) {
                    var l = b.length;
                    b.copy(buffer, n, 0, l);
                    n += l;
                });
                break;
        }
        gzip.removeAllListeners();
        gzip = null;

        fs.writeFile( __dirname + '/out.zip',
            buffer
            , function(err) {
                if(err) {
                    return console.log(err);
                }
                console.log("The file was saved!");
            });
    });

    gzip.write(result);
    gzip.end();
};


readFile();



