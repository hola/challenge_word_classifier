var filter = require('./filter');
var fs = require('fs');

var lineReader = require('readline').createInterface({
  input: require('fs').createReadStream('./../info/words-unique.txt')
});

var fs = require('fs');
var stream = fs.createWriteStream("./../info/words-unique-filtered.txt");
stream.once('open', function(fd) {
  lineReader.on('line', function (line) {
    var response = filter.test(line);
    if (response){
      stream.write(line + '\r\n');
    }
  });
});