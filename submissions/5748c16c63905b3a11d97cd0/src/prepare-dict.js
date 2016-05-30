const fs = require('fs');
const solution = require('./solution/solution');

fs.readFile('./dict.txt', 'utf-8', function(err, data) {
    var words = data.split('\n'),
        out = {},
        obj = {}, sub = 5,
        sett = new Set();

    words.forEach(function(word) {
        sett.add(word.toLowerCase());
    });

    words.forEach(function(word) {
        var bWord = solution.prepareWord(word);

        if (bWord.length <= 13 && bWord.length > 2 && bWord.indexOf("'") < 0) {
            out[bWord] = 1;
        }
        var k = word.toLowerCase().slice(-1*sub);
        obj[k] = (obj[k] || 0) + (sett.has(word.toLowerCase().slice(0,-1*sub)) ? 1 : -1);
    });
    Object.keys(obj).forEach(key => {
       if (obj[key] < 500) {
           delete obj[key];
       }
    });
    fs.writeFile('./new-dict.txt', Object.keys(out).join('\n'));
    fs.writeFile('./analys1.txt', JSON.stringify(obj, null, '\t'));
    //fs.writeFile('./arr1.txt', Object.keys(obj).join("','"));
});
