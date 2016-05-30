var hola = require("./index.min.js");
var request = require('request');

const zlib = require('zlib');
const fs = require('fs');
const input = fs.readFileSync('./filters/filter.txt.gz');
var buffer = zlib.gunzipSync(input);
hola.init(buffer);
var correct = 0;


request('https://hola.org/challenges/word_classifier/testcase', function (error, response, body) {
  if (!error && response.statusCode == 200) {
    var body=JSON.parse(body);
    for(var key in body){
    	var res = hola.test(key);
    		if(res==body[key])
    			correct+=1;
    	console.log(key,body[key],res);
    }
    console.log(correct,Object.keys(body).length);
  }
});
