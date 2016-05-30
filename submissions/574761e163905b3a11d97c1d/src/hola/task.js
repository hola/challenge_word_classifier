function check(word) {
  var fs = require('fs');
  var array = fs.readFileSync('words.txt').toString().split('\n');
  for (i in array) {
    if (array[i] === word) return true;
  }
  return false;
}