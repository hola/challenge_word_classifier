var iseng = require('../index.js');
var path = require('path');

var isAbbreviation = function(word) {
  var capitalsCount = (word.match(/is/g) || []).length;
  return capitalsCount / word.length > 0.5;
};

var lineReader = require('readline').createInterface({
  input: require('fs').createReadStream(path.join(__dirname, 'words.txt'))
});

// generate pattern and count pattern occurrence
var patternsCount = {};
lineReader.on('line', function (line) {
  var word = (line || "").trim();
  if (word.length > 0 && !isAbbreviation(word)) {
    var pattern = iseng.toPattern(word);
    // patternsCount[pattern] = (patternsCount[pattern] || 0) + 1;
    if (patternsCount[pattern] == undefined) {
      patternsCount[pattern] = 1;
    } else {
      patternsCount[pattern] = 3;
    }
  }
});

lineReader.on('close', function() {
  // generate data, ignore pattern if count < 3
  var fs = require('fs');
  var writeStream = fs.createWriteStream(path.join(__dirname, 'result.txt'), { flags : 'w' });
  for (var pattern in patternsCount) {
    if (patternsCount.hasOwnProperty(pattern)) {
      var count = patternsCount[pattern];
      if (count >= 2) {
        writeStream.write(" " + pattern);
      }
    }
  }
  writeStream.end();

  var zlib = require('zlib');
  var gzip = zlib.createGzip();
  var inp = fs.createReadStream('result.txt');
  var out = fs.createWriteStream('result.txt.gz');
  inp.pipe(gzip).pipe(out);
});


