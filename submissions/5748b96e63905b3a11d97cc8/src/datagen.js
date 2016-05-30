var fs = require('fs');
var readline = require('readline');
var stream = require('stream');
var instream = fs.createReadStream('words.txt');
var outstream = new stream;
var rl = readline.createInterface(instream, outstream);
var data = {};
var powerData = {};
var vowels = ['a', 'e', 'i', 'o', 'u', 'y'];
var letters = "esainortlcudmph'gbyfkvwzxjq".split('');
rl.on('line', function(word) {
  if (word.length == 3 &&
    word.indexOf('a') == -1 &&
    word.indexOf('e') == -1 &&
    word.indexOf('i') == -1 &&
    word.indexOf('o') == -1 &&
    word.indexOf('u') == -1 &&
    word.indexOf('y') == -1) return;
  word = word.toLowerCase();
  console.log(word);
  var oldSeq = '';
  var preSeq = '';
  var curSeq = '';
  var lastWasVowel = false;
  var lastWasConso = false;
  var power = 0;
  for (var i = 0; i < word.length; i++) {
    var letter = word[i];
    var isVowel = vowels.indexOf(letter) > -1;
    var isConso = !isVowel;
    if ((isVowel && lastWasConso) || (isConso && lastWasVowel)) {
      oldSeq = preSeq;
      preSeq = curSeq;
      curSeq = '';
      if (!data[oldSeq]) data[oldSeq] = [];
      if (data[oldSeq].indexOf(preSeq) == -1) data[oldSeq].push(preSeq);
    }
    curSeq += letter;
    lastWasVowel = isVowel;
    lastWasConso = !lastWasVowel;
    power += letters.indexOf(letter) ^ i;
  }
  oldSeq = preSeq;
  preSeq = curSeq;
  curSeq = '';
  if (!data[oldSeq]) data[oldSeq] = [];
  if (data[oldSeq].indexOf(preSeq) == -1) data[oldSeq].push(preSeq);
  while (power > 99) {
    power -= 100;
  }
  if (!powerData[word.length]) powerData[word.length] = [];
  if (powerData[word.length].indexOf(power) == -1) powerData[word.length].push(power);
});
rl.on('close', function() {
  Object.keys(data).map(function(key) {
    var seqs = [];
    for (var i = 0; i < data[key].length; i++) {
      var seq = data[key][i];
      if (seq != "'s" && seq.endsWith("'s")) {
        seqs.push(seq);
      }
    }
    for (var i = 0; i < seqs.length; i++) {
      var seq = seqs[i].split("'s")[0];
      var idx = data[key].indexOf(seq);
      if (idx > -1) {
        data[key].splice(idx, 1);
      }
    }
  });
  var text = '';
  Object.keys(data).map(function(key) {
    text += key + ',';
    text += data[key].join(',');
    text += '|';
  });
  text = text.slice(0, -1);
  text += '/';
  Object.keys(powerData).map(function(key) {
    text += key + ',';
    text += powerData[key].join(',');
    text += '|';
  });
  text = text.slice(0, -1);
  fs.writeFile("data.txt", text, function(err) {
    if (err) return console.log(err);
    console.log("The file was saved!");
  });
});


