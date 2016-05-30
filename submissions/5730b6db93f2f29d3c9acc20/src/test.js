var script = require('./script.js');
var assert = require('assert');
var request = require('request');
var url = "https://hola.org/challenges/word_classifier/testcase/1999479206";
//var url = "https://hola.org/challenges/word_classifier/testcase";

// init
if (script.init) {
  var fs = require("fs");
  fs.readFile("./data.json", 'utf8', function (err, data) {
    if (err) {
      console.log(err);
      process.exit(1);
    }
    script.init(data);
  });
}

request({
    url: url,
    json: true
}, function (error, response, body) {

    if (!error && response.statusCode === 200) {
      var total = 0;
      var correct = 0;
      var maxlength = 0;
      for (var k in body) {
        total++;
        var answer = script.test(k);
        if (answer !== body[k]) {
          console.log(k + " -> " + body[k]);
        } else {
          correct++;
        }
        if (body[k]) {
          if (maxlength < k.length) {
            maxlength = k.length;
          }
        }
      }

      console.log('Detected ' + correct + ' out of ' + total);
      console.log('\nStatistic\n max length = ' + maxlength);
    }
})

