const file = require('fs').readFileSync('./data.txt', {encoding: 'utf8'});

const words = file.split(/\r\n/).map(word => word.toLowerCase());

const longestConsonants = words.reduce(function (length, word) {
    const match = word.match(/[zxcvbnmsdfghjklqwrtp]+/g);
    if (match) {
        const lengths = match.map(({length}) => length);
        const maxLength = Math.max(...lengths);
        return Math.max(length, maxLength);
    } else {
        return length;
    }
}, 0);

const longestVowels = words.reduce(function (length, word) {
    const match = word.match(/[aeyuio]+/g);
    if (match) {
        const lengths = match.map(({length}) => length);
        const maxLength = Math.max(...lengths);
        return Math.max(length, maxLength);
    } else {
        return length;
    }
}, 0);

const lettersTriple = {};

words.filter(({length}) => length >= 3).forEach(word => {
    for (let i = 0; i < word.length - 3; i++) {
        const slice = word.slice(i, i + 3);
        lettersTriple[slice] = true;
    }
});

require('fs').writeFileSync(
    'result.txt',
    `${longestConsonants}*${longestVowels}*${Object.keys(lettersTriple).join(',')}`,
    {encoding: 'utf8'}
);