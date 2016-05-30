var fs = require('fs');
var words = require('./words.json');

console.log('Количество слов до: ' + words.length);

var result = {};

words.forEach(function (word) {
    result[word.toLowerCase()] = true;
});

var arr = [];

for(var key in result){
    arr.push(key);
}

console.log('Количество слов после: ' + arr.length);

fs.writeFile('./data/lowerWords.json', JSON.stringify(arr));