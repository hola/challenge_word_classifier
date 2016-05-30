const alphabet = require('./alphabet.js');
const Bloom = require('./bloom.js');

module.exports = {
    /**
     * Inits module with the given data for Bloom's filters
     *
     * @param  {Buffer} data
     */
    init: function(data) {
        this._data = JSON.parse(data.toString());
        this._filters = this._createFilters();
    },

    /**
     * Tests the given word
     *
     * @param  {String} word
     * @return {Boolean}
     */
    test: function(word) {
        if (word[0] === '\'') {
            return false;
        }
        return this._filters[word[0]].test(word);
    },

    /**
     * Creates hash map with Bloom's filters.
     * Key is an english letter and value is a Bloom's filter
     * which can filter words which starts from the letter.
     *
     * @private
     * @return {Object}
     */
    _createFilters: function() {
        return alphabet
            .map((letter, n) => {
                return [letter, new Bloom(this._data[n])];
            })
            .reduce((hash, arr) => {
                const letter = arr[0];
                const bloom = arr[1];

                hash[letter] = bloom;

                return hash;
            }, {});
    }
};
