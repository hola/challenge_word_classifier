const hash = require('./hash.js');

class Bloom {
    /**
     * Creates a new Bloom's filter.
     * Could be initialized with the given bitmap.
     *
     * @param {Array} [bitmap]
     */
    constructor(bitmap) {
        this._bitmap = bitmap || new Array(hash.LENGTH).fill(0);
    }

    /**
     * Adds the given word to the filter
     *
     * @param {String} word
     */
    add(word) {
        const bits = hash(word);

        for (let i = 0; i < hash.LENGTH; i++) {
            if (bits[i]) {
                this._bitmap[i] = 1;
            }
        }
    }

    /**
     * Tests the given word. True means maybe :)
     *
     * @param  {String} word
     * @return {Boolean}
     */
    test(word) {
        const bits = hash(word);

        for (let i = 0; i < hash.LENGTH; i++) {
            if (bits[i] && !this._bitmap[i]) {
                return false;
            }
        }
        return true;
    }

    /**
     * Returns the bitmap for the current filter
     *
     * @return {Array}
     */
    getBitmap() {
        return this._bitmap;
    }
};

module.exports = Bloom;
