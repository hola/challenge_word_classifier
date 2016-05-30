function getPatterns(input) {
    var words, key, size, characterClasses, pattern, numSyllables, numVowels, firstVowels, firstConsonant, syllable,
        syllables = /[^aeiouy]*[aeiouy]*/g,
        consonants = /[^aeiouy]/g,
        vowels = /[aeiouy]/g,
        output = '',
        map = {};

    // get unique words
    words = new Set;
    input.match(/\S{2,}/g).forEach(word => {
        words.add(word);
    });

    // map a dicitionary 
    //>>> key: <<<<< This part is the most important. the key base for regex
    [...words].forEach(word => {
        key = word.length; // in this case, generate regex by word lengths <- the simplest I think

        if (key in map) map[key].push(word);
        else map[key] = [word];
    });

    // foreach group/key
    for (key in map) {
        words = map[key];

        // greatest length
        size = words.reduce((x, y) => y.length > x ? y.length : x, 0);

        // starts each character class empty
        characterClasses = [...Array(size)].map(_ =>
            (new Set)
        );

        // populate character classes
        words.forEach(word => {
            [...word].forEach((letter, position) => {
                characterClasses[position].add(letter);
            });
        });


        // get each character class
        pattern = characterClasses
            .reduce((value, cc) => {
                var maximum = 27;  // <<<<<<<<<<<  the maximum characters your characterClass can group
                if (cc.size == maximum) {
                    return value + '.';
                }
                if (cc.size > (maximum / 2 | 0)) { // vvvvvvvvvv<<< remember to update initial negation of regex
                    return value + "[^abcdefghijklmnopqrstuvwxyz']".replace(RegExp('[' + [...cc].join('') + ']', 'g'), '');
                }
                return value + '[' + [...cc].sort().join('') + ']';
            }, '')
            .replace(/\[(.)\]/g, '$1');

        // final pattern for regex
        output += key + ':"' + pattern + '"\n';
    }

    output = new Buffer(output);

    fs.open('output.txt', 'w', (err, fd) => {
        fs.write(fd, output, 0, output.length, null, err => {
            fs.close(fd);
        });
    });

}


// ----------------------------------------------------------------------------------


var input,
    fs = require('fs');

fs.readFile('words.txt', 'utf8', (err, data) => {
    input = (err || data).toLowerCase();
    getPatterns(input);
});

