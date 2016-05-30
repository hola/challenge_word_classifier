
const fs = require('fs');
const zlib = require('zlib');
const solution = require('./solution.min.js');


var data = zlib.gunzipSync(fs.readFileSync('data.gz'));

if (solution.init)
    solution.init(data);

var words = fs.readFileSync('words.txt', 'utf8').split("\n");
var nonwords = fs.readFileSync('nonwords.txt', 'utf8').split("\n");

function testWords(words) {
    var result = {yes: 0, count: 0};
    words.forEach(function(word){
        word = word.toLowerCase();
        if (solution.test(word))
                ++result.yes;
        else {
            //console.log(word);
        }
        ++result.count;
    });
    return result;
}


console.log("Testing...");

function showStat(stat) {
    console.log(
        "Count: "+stat.count
        +", TP: "+stat.tp
        +", TN: "+stat.tn
        +", FP: "+stat.fp
        +", FN: "+stat.fn
        +", Level: "+(Math.floor(stat.level*1000)/10)+"%"
    );
}

console.log("Words:");
var result = testWords(words);
var stat = {
    count: result.count,
    tp: result.yes,
    tn: 0,
    fp: 0,
    fn: (result.count-result.yes),
    level: result.yes/result.count
};
showStat(stat);


console.log("Non-words:");
result = testWords(nonwords);
var stat2 = {
    count: result.count,
    tp: 0,
    tn: (result.count-result.yes),
    fp: result.yes,
    fn: 0,
    level: (result.count-result.yes)/result.count
};
showStat(stat2);

console.log("Total:");
var statTotal = {
    count: stat.count + stat2.count,
    tp: stat.tp + stat2.tp,
    tn: stat.tn + stat2.tn,
    fp: stat.fp + stat2.fp,
    fn: stat.fn + stat2.fn,
    level: (stat.tp + stat2.tp + stat.tn + stat2.tn)/(stat.count + stat2.count)
};

showStat(statTotal);

