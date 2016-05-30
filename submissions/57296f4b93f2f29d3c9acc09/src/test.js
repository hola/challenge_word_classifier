var request = require('request');
var check = require('./check');

var toto = 0;
var seed = Math.floor(Math.random()*10000000);
request("https://hola.org/challenges/word_classifier/testcase/" + seed, function (error, response, body) {
  if (!error && response.statusCode == 200) {
    var test1 = JSON.parse(body);
    var good = 0;
	for(key in test1) {
		var real = test1[key];
		var my = check.test(key);
		if(real === my) {
			good++;
		}
	}
	console.log("For seed " + seed + ", success is " + good + "%");
  }
});

