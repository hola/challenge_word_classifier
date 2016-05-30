var U = {

    // Bloom size
    _B: 502122,

    // Global
    _bigramProbability: [],
    _bloom: [],
    _tested: 0,
    _map: [],

    bigramIndex: function (bigram) { // string [2]
        return (bigram.charCodeAt(0) - 97) * 26 + bigram.charCodeAt(1) - 97;
    },

    hashString: function (word) { // string, int

        var result = 0;
        //for(var c of word) {
        //    result = ((result + c.charCodeAt(0)) * 115249 + 33391) % U._B;
        //}
        for (var i = 0; i < word.length; i++) {
            result = ((result + word.charCodeAt(i)) * 115249 + 33391) % U._B;
        }
        return result;
    },

    countPropabilityBigram: function (bigramProbabilityBuf) {
        var result = [];
        var summary = 4208105;

        for (var i = 0; i < 676; i++) {
            result[i] = bigramProbabilityBuf.readUInt16LE(i * 2) / summary;
        }

        return result;
    },

    readBloom: function (bloomBuf) {
        var bloomResult = [];
        for (var i = 0; i < U._B; i += 8) {
            var value = bloomBuf.readUInt8(i / 8);
            for (var j = 7; j >= 0; --j) {
                bloomResult[i + j] = value & 1;
                value = value >> 1;
            }
        }
        return bloomResult;
    }
};

/**
 * Init function
 * @param inputBuf
 */
exports.init = function (inputBuf) {

    var bigramProbabilityBuf = new Buffer.alloc(1352);
    var bloomBuf = new Buffer.alloc((U._B + 7) / 8);

    inputBuf.copy(bigramProbabilityBuf, 0, 0, 1352);
    U._bigramProbability = U.countPropabilityBigram(bigramProbabilityBuf);

    inputBuf.copy(bloomBuf, 0, 1352, inputBuf.length);
    U.bloom = U.readBloom(bloomBuf);
};


/**
 * Check function
 * @param word
 */
exports.test = function (word) {

    ++U._tested;
    U._map[word] = U._map[word] || 0;
    var count = ++U._map[word];

    if ((count > 6 && count > U._tested / 115e3)
        || (U._tested > 135e4 && count < 1.01 + U._tested / 414e4))
        return 0;

    if (U._map.length > 1e8 && U._tested < U._map.length * 2) {
        U._map = U._map.filter(function (i) {
            return i > 1;
        });
    }

    var n = word.length,
        wordForBloom = word,
        isSword = 0,
        bigramProbSum = 0,
        bigramProb = 1,
        bigramSqrt = 0,
        bigramProbMax = [
            -21,
            -25,
            -33, // 5
            -40,
            -45,
            -52,
            -57,
            -63, // 10
            -69,
            -71,
            -72,
            -72,
            -74, // 15
            -80,
            -67,
            -73
        ],
        bigramSumMin = [
            0.6,
            0.8,
            1.2, // 10
            1.5,
            2.4,
            3.5,
            4.3,
            6.0, // 15
            8.0,
            12,
            17
        ],
        bigramSumSqrt = [
            0.29, // 9
            0.36, // 10
            0.42,
            0.57,
            0.7,
            0.86,
            1.05, // 15
            1.22,
            0,
            0
        ],
        m = n,
        E = word.match(/'/g),
        containAp = E ? E.length : 0;

    if (word.match(/'s$/)) {
        isSword = 1;
        m = n - 2;
        wordForBloom = word.substr(0, m);
    }

    if (n == 3 && isSword)
        return 1;

    if (n < 3 && containAp) {
        return 0;
    }

    if (n == 1)
        return 1;

    if (!U.bloom[U.hashString(wordForBloom.substr(0, 8))]) {
        return 0;
    }

    if (n < 3) {
        return 1;
    }


    for (var i = 1; i < m; ++i) {
        var probability = U._bigramProbability[U.bigramIndex(word.substr(i - 1, 2))];
        bigramProbSum += probability;
        bigramProb *= probability;
        bigramSqrt += Math.sqrt(probability);
    }
    bigramProb = Math.log(bigramProb);

    return !(["dg", "tw", "wh", "cl", "nr", "dn", "br", "pr", "gl", "cr", "tr"].indexOf(word.substr(m - 2, 2)) != -1
    || word[n - 1] == 'q'
    || word.match(/[auioe]{6}/)
    || word.match(/[^auiyoe]{6}/)
    || (containAp && !isSword)
    || containAp > 1
    || (word.match(/([a-z])(\1)(\1)/) && n > 3)
    || U._bigramProbability[U.bigramIndex(word.substr(0, 2))] < 4.9e-6
    || n > 18
    || bigramProb < bigramProbMax[n - 3]
    || (m > 13 && bigramProb < bigramProbMax[m - 3])
    || (m >= 8 && bigramProbSum * 73 < bigramSumMin[m - 8])
    || (m > 8 && bigramSqrt < bigramSumSqrt[m - 9]))
};