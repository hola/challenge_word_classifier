// This script simulates Hola tester environment

var zlib = require('zlib');
var fs = require('fs');

var candidate = require("./solution.min.js");
var data = fs.readFileSync("data.gz");
var words = fs.readFileSync("./ann_cpp/words.lst.json");

var slice = 1000,
    cntCorrect = 0,
    pctCorrect;

dataDec = zlib.gunzipSync(data);
candidate.init(dataDec);

words = JSON.parse(words.toString());
words = words.slice(0, slice);
for (var pair of words) {
    var word  = pair[0],
        state = pair[1];

    if (candidate.test(word) == state) cntCorrect++;
}

pctCorrect = cntCorrect / slice * 100;
console.log("Percentage correct: " + pctCorrect);

