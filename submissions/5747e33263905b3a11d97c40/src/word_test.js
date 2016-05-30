const fs = require('fs');

var data = fs.readFileSync('./tmp/all.bloom');
var testWords = require('./tmp/test-0.json')
var wc = require('./word_classifier.js')
var count = 0;

wc.init(data);

for(var word in testWords){
  var present = wc.test(word)

    if(present != testWords[word]){
      count = count + 1;
      console.log(`Word: ${word} : ${present} : ${testWords[word]}`);
    }
}

console.log(`Total not matching ${count}`);
