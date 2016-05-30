/**
 *
 */
function Bloom(bloomBuffer) {
    var _bloomFilter = new Uint8Array(bloomBuffer);
    var _bloomSizeInBytes = _bloomFilter.length - 1;
    var _bloomSize = _bloomSizeInBytes * 8;
    var _hashCounts = _bloomFilter[_bloomFilter.length - 1];

    this.test = function (word) {
        var hashes = calculateHashes(word);
        for (var i = 0; i < _hashCounts; i++) {
            if (getBit(hashes[i]) === 0) {
                return false;
            }
        }
        return true;
    };

    function getBit(bitIndex) {
        var byteIndex = Math.floor(bitIndex / 8);
        var bitIndexInByte = bitIndex % 8;

        return _bloomFilter[byteIndex] & (1 << bitIndexInByte);
    }

    function calculateHashes(word) {
        var calculatedHashes = [];
        for (var i = 0; i < _hashCounts; i++) {
            calculatedHashes[i] = murmurhash2_32_gc(word, (i + 32) << 2 + (i << 5) + (i << 15)) % _bloomSize;
        }

        return calculatedHashes;
    }

    // https://github.com/garycourt/murmurhash-js
    function murmurhash2_32_gc(str, seed) {
        var
            l = str.length,
            h = seed ^ l,
            i = 0,
            k;

        while (l >= 4) {
            k =
                ((str.charCodeAt(i) & 0xff)) |
                ((str.charCodeAt(++i) & 0xff) << 8) |
                ((str.charCodeAt(++i) & 0xff) << 16) |
                ((str.charCodeAt(++i) & 0xff) << 24);

            k = (((k & 0xffff) * 0x5bd1e995) + ((((k >>> 16) * 0x5bd1e995) & 0xffff) << 16));
            k ^= k >>> 24;
            k = (((k & 0xffff) * 0x5bd1e995) + ((((k >>> 16) * 0x5bd1e995) & 0xffff) << 16));

            h = (((h & 0xffff) * 0x5bd1e995) + ((((h >>> 16) * 0x5bd1e995) & 0xffff) << 16)) ^ k;

            l -= 4;
            ++i;
        }

        switch (l) {
            case 3:
                h ^= (str.charCodeAt(i + 2) & 0xff) << 16;
            case 2:
                h ^= (str.charCodeAt(i + 1) & 0xff) << 8;
            case 1:
                h ^= (str.charCodeAt(i) & 0xff);
                h = (((h & 0xffff) * 0x5bd1e995) + ((((h >>> 16) * 0x5bd1e995) & 0xffff) << 16));
        }

        h ^= h >>> 13;
        h = (((h & 0xffff) * 0x5bd1e995) + ((((h >>> 16) * 0x5bd1e995) & 0xffff) << 16));
        h ^= h >>> 15;

        return h >>> 0;
    }
}

function Matrix(Buffer) {
    var _matrix = new Uint8Array(Buffer);
    var _dimension = _matrix[_matrix.length - 2];
    var _syllables = _matrix[_matrix.length - 1];

    var _bytesInRecord = Math.ceil((_syllables + 1) / 8);
    var _bitsInRecord = _bytesInRecord * 8;

    var _size = 27 * _bytesInRecord;

    var _dimSizes = [];
    _dimSizes[0] = 0;
    for (var i = 1; i < _dimension; i++) {
        _dimSizes[i] = _size;
        _size *= 27;
    }

    this.test = function (word) {
        var parts = word.length - _dimension + 1;

        for (var i = 0; i < parts; i++) {
            var symbols = word.slice(0, 1) + word.slice(i + 1, i + _dimension);
            var index = calculateBitIndex(symbols, i);

            if (index.byte !== -1) {
                if (!getBit(index)) {
                    return false;
                }
            }

            if (i + 1 == parts) {
                if (!getBit(calculateBitIndex(symbols, _bitsInRecord - 1))) {
                    return false;
                }
            }
        }

        return true;
    };

    ///

    function calculateBitIndex(symbols, syllableIndex) {
        var index = {
            byte: 0,
            bit : 0
        };

        if (symbols.length !== _dimension) {
            index.byte = -1;
            return index;
        }

        var dim = _dimension;

        symbols.split('').forEach(function (symbol) {
            dim--;
            var charIndex = symbol.charCodeAt(0) - 96;

            if (dim == 0) {
                index.byte += charIndex * _bytesInRecord + Math.floor(syllableIndex / 8);
            } else {
                index.byte += charIndex * _dimSizes[dim];
            }
        });
        index.bit = syllableIndex % 8;
        return index;
    }

    function getBit(index) {
        return _matrix[index.byte] & (1 << index.bit);
    }
}

var bloom, bloomEx, matrix;

function checkException(word) {
    if ((word.length == 1) && word.match(/^[a-z]{1,1}$/g)) {
        return true;
    }

    if ((word.length == 2) &&
        word.match(/(a[a-z])|(b[a-ik-pr-z])|(c[a-wy-z])|(d[a-z])|(e[a-il-z])|(f[a-gil-pr-z])|(g[a-eg-ik-wy])|(h[a-wy-z])|(i[a-gi-z])|(j[ac-egi-jlo-pr-vy])|(k[a-egi-jl-pr-wy])|(l[a-jl-pr-z])|(m[a-pr-y])|(n[a-jl-mo-wy-z])|(o[a-pr-z])|(p[a-ik-y])|(q[a-fh-il-np-vy])|(r[a-jl-y])|(s[a-y])|(t[a-eg-ik-pr-y])|(u[a-dg-ik-npr-x])|(v[a-gi-jl-pr-x])|(w[a-ik-mo-pr-wy])|(x[a-eiln-x])|(y[a-bd-fim-pr-vy])|(z[a-bdgik-ln-or-uz])/g)) {
        return true;
    }

    return bloomEx.test(word);
}

function simpleCheck(word) {
    if (word.match(/[^a-z\']/g)) {
        return false;
    }

    if (word.match(/\'\'/g)) {
        return false;
    }

    if (word.match(/^\'/g)) {
        return false;
    }

    if (word.match(/\'.{2,}$/g)) {
        return false;
    }

    if (word.match(/^.{1,2}$/g)) {
        return false;
    }

    return !word.match(/\'[a-rt-z]+$/g);
}

exports.init = function (data) {
    var size, position;
    position = 0;
    size = data.readUInt16LE(position);
    position += 2;

    bloom = new Bloom(data.slice(position, position + size));

    position += size;
    size = data.readUInt16LE(position);
    position += 2;
    bloomEx = new Bloom(data.slice(position, position + size));

    position += size;
    size = data.readUInt16LE(position);
    position += 2;

    matrix = new Matrix(data.slice(position, position + size));
};

const PREFIX_SIZE = 7;

exports.test = function (word) {
    if (!simpleCheck(word)) {
        return checkException(word);
    } else {
        var wordNorm = word.replace(/\'s$/g, '`');
        var matrixResult = matrix.test(wordNorm);

        var result = true;
        var tmp = wordNorm.slice(0, PREFIX_SIZE);

        if (tmp.length >= PREFIX_SIZE) {
            result = bloom.test(tmp);
        }

        return matrixResult && result;
    }
};
