const ALPHABET = require('./alphabet.js').concat(['\'']);

/**
 * Threegrams for english alphabet,
 * e.g. aaa, aab, aac, ..., baa, bab, bac, ...
 */
const THREEGRAMS = (function() {
    var bigrams = ALPHABET.map((a) => {
        return ALPHABET.map(b => a + b);
    }).reduce((memo, arr) => {
        return memo.concat(arr);
    }, []);

    return ALPHABET.map((a) => {
        return bigrams.map(b => a + b);
    }).reduce((memo, arr) => {
        return memo.concat(arr);
    }, []);
}());

/**
 * Returns threegrams for the given word
 *
 * @return {String}
 */
const getThreeGrams = function(word) {
    let l = word.length;
    let threegrams = [];

    while (l--) {
        threegrams.push(word.slice(l-2, l+1));
    }
    return threegrams.filter(Boolean);
};

/**
 * Hash function for Bloom's filter.
 * Returns bitmap where 1 complies to the threegram from the word.
 *
 * @param  {String} word
 * @return {Array}
 */
const hash = function(word) {
    const threegrams = getThreeGrams(word);

    return THREEGRAMS.map((threegram) => {
        if (threegrams.find(i => i === threegram)) {
            return 1;
        }
        return 0;
    });
};

/**
 * length of the bitman: (26 + 1)^3
 * @type {Number}
 */
hash.LENGTH = THREEGRAMS.length;

module.exports = hash;
