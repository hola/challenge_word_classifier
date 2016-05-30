var fs = require('fs');
var _ = require('underscore');
var file = fs.readFileSync('/Users/aricheimer/Development/hola/challenge_word_classifier/words.txt', "utf8");
var words = file.split('\n');
var validWords = _.filter(words, function(word){return /^[a-z']+$/.test(word);});
var wordsWithoutVowels = _.filter(validWords, function(word){return /^[^aeiou]+$/.test(word)});
var longWords = _.filter(validWords, function(word){return word.length >= 20});
var shortWords = _.filter(validWords, function(word){return word.length <= 4});
var qWords = _.filter(validWords, function(word){return /^.*q.*$/.test(word)});
qWords.sort(function(a,b){
  return a.length - b.length;
});
qWords = qWords.slice(0, 500);
var rareRatios = [
  '1.0',
  '1.2',
  '1.3',
  '1.4',
  '1.5',
  '1.6',
  '1.7',
  '1.9',
  '10',
  '11',
  '12',
  '3.4',
  '3.6',
  '3.8',
  '4.7',
  '4.8',
  '5.3',
  '5.7',
  '6.5',
  '7.5',
  '8.0',
  '9.0'
];
var rareRatioWords = _.filter(_.difference(validWords, wordsWithoutVowels), function(word){
  var wordLength = word.length;
  var vowelCount = word.match(/[aeiou]/gi).length;
  var ratio = (wordLength / vowelCount).toPrecision(2);
  return rareRatios.indexOf(ratio) > -1;
})

var wordsForList = _.union(wordsWithoutVowels, longWords, shortWords, rareRatioWords, qWords);
var sorted = wordsForList.sort(function(a,b){
  var reversedA = a.split("").reverse().join("");
  var reversedB = b.split("").reverse().join("");
  return reversedA.localeCompare(reversedB);
});
console.log("Total number of words in file: ", sorted.length);

fs.writeFileSync('/Users/aricheimer/Development/hola/sorted_valid_words15.txt', sorted.join('\n'));
