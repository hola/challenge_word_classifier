const fs = require("fs");
const zlib = require("zlib");
const mod = require("./module");

console.log("Loading data...");

const words = fs.readFileSync("data/words.txt").toString().split(/\s+/).filter(function(e) { return e.length > 0; });
const nonwords = fs.readFileSync("data/nonwords.txt").toString().split(/\s+/).filter(function(e) { return e.length > 0; });

console.log("Loading module...");

var gzBuffer = fs.readFileSync("features.gz");
var buffer = zlib.gunzipSync(gzBuffer);

mod.init(buffer);

console.log("Calculating accuracy...");

// ---------------- truw words check ----------------

var truePos = 0;
var falsePos = 0;
var trueNeg = 0;
var falseNeg = 0;

words.forEach(function(line) {
    var word = line.toLowerCase();

    if (mod.test(word)) {
        truePos += 1;
    } else {
        falsePos += 1;
    }
});

nonwords.forEach(function(line) {
    var word = line.toLowerCase();

    if (mod.test(word)) {
        falseNeg += 1;
    } else {
        trueNeg += 1;
    }
});

console.log("accuracy = " + (truePos + trueNeg) / (truePos + falsePos + trueNeg + falseNeg) + "), TP=" + truePos + ", FP=" + falsePos + ", TN=" + trueNeg + ", FN=" + falseNeg);
