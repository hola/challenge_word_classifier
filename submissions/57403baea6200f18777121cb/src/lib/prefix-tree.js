'use strict';

exports.fromFile = (path, transform) => {
    const words = require('fs').readFileSync(path, 'utf8').split('\n');
    return exports.fromArray(words, transform);
};

exports.fromArray = (words, transform) => {
    transform = transform || (x => x);

    const root = {};

    for (let word of words) {
        let current = root;
        word = transform(word);
        for (let letter of word) {
            if (letter === '\'') {
                letter = '0';
            }
            if (current.hasOwnProperty(letter)) {
                current = current[letter];
            } else {
                let newNode = {};
                current[letter] = newNode;
                current = newNode;
            }
        }
    }

    return root;
};
