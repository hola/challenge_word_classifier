const fs = require('fs');
const path = require('path');

const Bloom = require('./bloom.js');
const ALPHABET = require('./alphabet.js');

/**
 * Prepare data for Bloom's filters:
 *
 * - read files with groups of words
 * - create a new filter for each file
 * - add words from the group
 * - return the bitmap
 *
 * Bitmaps for each filter stored in the bloom-data.json file
 * which will be used in runtime as an initial data
 */

Promise.all(ALPHABET.map((letter) => {
    return new Promise((res, rej) => {
        const file = path.join(process.cwd(), process.argv[2], 'words_' + letter + '.txt');

        fs.readFile(file, 'utf-8', (err, data) => {
            if (err) {
                return rej(err);
            }
            res({ words: data.split('\n').filter(Boolean), letter: letter });
        });
    });
}))
    .then((results) => {
        return results.map((result) => {
            var bloom = new Bloom();
            var t1 = Date.now();

            console.log('start processing ' + result.letter);
            result.words.forEach(
                word => bloom.add(word)
            );
            console.log('stop processing ' + result.letter, 't = ' + (Date.now() - t1) / 1000 + 's');
            return bloom.getBitmap();
        });
    })
    .then((bitmaps) => {
        fs.writeFile('bloom-data.json', JSON.stringify(bitmaps));
    })
    .catch((err) => {
        console.log(err);
    });
