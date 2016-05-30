var fs = require('fs');
var FuzzySet = require('fuzzyset.js');
var f = new FuzzySet();

var REQUIRED_DIFFERENCE = parseFloat(process.argv[2]) || 0.515;
var DATA_FILE = process.argv[3] || 'words.txt';
var OUTPUT_FILE = process.argv[4] || 'words-min.txt';
console.log(`Parsing file with ${REQUIRED_DIFFERENCE*100}% accuracy`);

var file = fs.readFileSync(DATA_FILE, 'utf-8').toLowerCase().split(' ');
file.forEach((v, i) => {
  if(i%2150===0) {
    console.log((i/file.length*100).toFixed(2) + `% done`);
  }
  var percents = f.get(v);
  if(percents && percents.length) {
    percents = percents[0][0];
    if(percents < REQUIRED_DIFFERENCE) {
      f.add(v);
    }
  }
  if(!percents || !f.length()) {
    f.add(v);
  }
});

fs.writeFileSync(OUTPUT_FILE, f.values().join(' '));