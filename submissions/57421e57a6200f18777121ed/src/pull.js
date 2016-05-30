
/*
 * USAGE:
 * node pullnowords.js -i 8000 -m 9000
 *    -i - start number
 *    -m - maximum number
 */


const https = require('https');
const fs = require('fs');

var i = 1;
var m = 2;

if (process.argv.indexOf('-i') != -1) i = +process.argv[process.argv.indexOf('-i') + 1] || 0;
if (process.argv.indexOf('-m') != -1) m = +process.argv[process.argv.indexOf('-m') + 1] || 0;

function pullNext() {
  if (i > m) {
    console.log('DONE');
    process.exit(0);
  }

  console.log('PULL ', i);

  https.get({
    host: 'hola.org',
    path: '/challenges/word_classifier/testcase/' + i.toString()
  }, function(response) {
    var json = '';
    response.on('data', d => { json += d; });
    response.on('end', () => {
      var obj = JSON.parse(json);
      Object.keys(obj).forEach(key => {
        if (obj[key] === true) {
          console.log(key)
          fs.appendFileSync('words-true.txt', key + '\n');
        } else if (obj[key] === false) {
          console.log(key, 'f')
          fs.appendFileSync('words-false.txt', key + '\n');
        }
      });
      i++;
      pullNext();
    });
  }).on('error', err => {
    console.error(err);
    process.exit(1);
  });
}

pullNext();
