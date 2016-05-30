var fs = require("fs");
var zlib = require('zlib');

var options = {
    mainFilterSize: 50*1024,
    mainPrefixLength: 7,
    ngramFilterSize: 20*1024,
    ngramFilterCount: 7,
    ngramLength: 3,
    ngramStep: 2,
    minWordLength: 4,
    maxWordLength: 20,
    wordsFile: 'words.txt',
    nonWordsFile: 'nonwords.txt'
};


var dataSize  = 0;
var data = [];

function djbHashFactory(initHash) {
    if (undefined === initHash) initHash = 13;
    return function(str) {
        var hash = initHash;
        for (i = 0; i < str.length; i++) {
            char = str.charCodeAt(i);
            hash = ((hash << 5) + hash) + char;
        }
        return hash >>> 0;
    }
}

function hashCode(initHash) {
    if (undefined === initHash) initHash = 13;
    return function(str) {
        var hash = initHash;

        for (i = 0; i < str.length; i++)
            hash = (hash * 33) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
}


function BitsFactory(size, fill) {
    var bits = [];

    if (undefined !== fill)
        for(var i=0;i<size/8;i++)
            bits[i] = fill

    return {
        set: function(index) {
            var i = Math.floor(index/8);
            bits[i] = bits[i] | (1 << (index % 8));
        },
        get: function(index) {
            return bits[Math.floor(index/8)] & (1 << (index % 8)) ? 1 : 0;
        },
        getBits: function() { return bits; },
        saveToFile: function(fileName) {

            var buffer = new Buffer(bits);
            fs.writeFileSync(fileName, buffer);
            data.push(buffer);
        }
    }
}

function BloomFilterFactory(sizeInBits) {
    var bits = BitsFactory(sizeInBits,0);
    var hashFunction = hashCode();

    function word2Index(word) {
        return  hashFunction(word) % sizeInBits;
    }

    return {
        addWord: function(word){
            bits.set(word2Index(word));
        },
        testWord: function(word){
            return bits.get(word2Index(word));
        },
        saveToFile: function(fileName) {
            bits.saveToFile(fileName);
        }
    }
}

function modelFactory(options) {

    var mainFilter = BloomFilterFactory(options.mainFilterSize*8);

    var ngramFilters = [];
    for(var i=0;i<options.ngramFilterCount;i++)
        ngramFilters[i] = BloomFilterFactory(options.ngramFilterSize*8);

    var words = fs.readFileSync(options.wordsFile, 'utf8').split("\n");


    function isBadWord(word) {
        return (word.length < options.minWordLength || word.length > options.maxWordLength);
    }


    function testWords(words) {
        var result = {yes: 0, count: 0};

        words.forEach(function(word){
            word = word.toLowerCase();
            if (!isBadWord(word) && mainFilter.testWord(word.substr(0,options.mainPrefixLength))) {

                var yes = true;
                for(var i= 0, filterIndex=0; i < word.length-options.ngramLength && filterIndex < options.ngramFilterCount; i+=options.ngramStep, ++filterIndex) {
                    var ngram = word.substr(i,options.ngramLength);
                    if (ngram.length<1) break;
                    if (!ngramFilters[filterIndex].testWord(ngram)) {
                        yes = false;
                        break;
                    }
                }

                if (yes)
                    ++result.yes;
            }
            ++result.count;
        });
        return result;
    }

    return {
        create: function() {
            console.log("Creating model...");
            words.forEach(function(word){
                if (!isBadWord(word)) {
                    word = word.toLowerCase();
                    mainFilter.addWord(word.substr(0, options.mainPrefixLength));

                    for(var i= 0, filterIndex=0; i < word.length-options.ngramLength && filterIndex < options.ngramFilterCount; i+=options.ngramStep, ++filterIndex) {
                        var ngram = word.substr(i,options.ngramLength);
                        if (ngram.length<1) break;
                        ngramFilters[filterIndex].addWord(ngram);
                    }
                }
            });
        },
        test: function() {
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

            var nonwords = fs.readFileSync(options.nonWordsFile, 'utf8').split("\n");

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
        },
        save: function() {
            mainFilter.saveToFile('bf.main');

            for(var i= 0; i < options.ngramFilterCount; i++)
                ngramFilters[i].saveToFile("bf.ng"+i);
        }
    }
}



var model = modelFactory(options);

model.create();
model.save();
model.test();


data = Buffer.concat(data);
fs.writeFileSync("data", data);
data = zlib.gzipSync(data,{level: 9});
fs.writeFileSync("data.gz", data);

console.log("Data size: "+data.length);
var stats = fs.statSync("solution.min.js");
console.log("Program size: "+stats["size"]);
console.log("Total size: "+(data.length+stats["size"]));

