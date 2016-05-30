const data = {};
module.exports = {
    init(_data) {
        _data = _data.toString('utf8').split('*');
        data.consonants = +_data[0];
        data.vowels = +_data[1];
        data.triples = _data[2].split(',');
    },
    test(word) {
        for (let i = 0; i < word.length - 3; i++) {
            const slice = word.slice(i, i + 3);
            if (data.triples.indexOf(slice) < 0) {
                return false;
            }
        }
        return Math.random() > 0.5;
    }
};