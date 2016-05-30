var fs = require('fs');
var getWordsParts = require('./getWordsParts');

function writeParts(words, number, filename, first) {
    var result = {};

    words.forEach(function (word) {
        var parts = getWordsParts(word, number);

        if(!first){
            parts.forEach(function (part) {
                if (result[part]) {
                    result[part] += 1;
                } else {
                    result[part] = 1;
                }
            });
        } else {
            if (result[parts[0]]) {
                result[parts[0]] += 1;
            } else {
                result[parts[0]] = 1;
            }
        }
    });

    var parts = [];

    for (var key in result) {
        if (key.length === number) {
            parts.push([result[key], key]);
        }
    }

    parts.sort(function (a, b) {
        if (a[0] > b[0])  return -1;
        if (a[0] < b[0])  return 1;

    });

    result = {};
    var allParts = 0;

    parts.forEach(function (tree) {
        allParts += tree[0];
    });

    parts.forEach(function (tree) {
        result[tree[1]] = +((tree[0] / allParts) * 100).toFixed(4);
    });

    fs.writeFile('./data/' + filename + '.json', JSON.stringify(result));
}

module.exports = writeParts;