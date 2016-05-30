var fs = require('fs');
var stemmer = require('./stemmer');
var _ = require("lodash");

//Original array of words
var dict = [];

function convert(input) {
	input = input.replace(/('s)$/, "");
    return stemmer(input);
}

/**
 * Get the occurrences of consonats and vowels for all the words after being "cleaned".
 */
function calculateConsonantsVowelsMap(dict) {

    var outputDict = [];

    _.each(dict, function(input) {

        var c = (input.match(/[^aeiouy]/gi) || []).length;
        var v = (input.match(/[aeiouy]/gi) || []).length;

        var found = _.find(outputDict, function(e) {
            return e.c == c && e.v == v;
        });

        if (!found) {
            found = {
                "c": c,
                "v": v,
                "count": 0
            }

            outputDict.push(found);
        }

        found.count += 1;
    });

    outputDict = _.sortBy(outputDict, function(o) {
        return -o.count;
    });

    // We are only interested on the most common combinations
    var mostCommon = _.dropRightWhile(outputDict, function(o) {
        return o.count < 500;
    });

    var out = {};
    _.each(mostCommon, function(e) {
        var element = out[e.c];
        if (!element) {
            out[e.c] = [e.v];
        } else {
            out[e.c].push(e.v);
        }
    });

    console.log(mostCommon)
    console.log(out);
};

/**
 * Iterate over all the input words, lower cased, and apply the convert function.
 * Writes the resulting array into a file: "words.txt"
 */
function clean() {

    var outputDict = [];

    _.each(dict, function(raw) {
        var converted = convert(raw);

        //Ignore "small" words
        if (converted.length <= 2) {
            return;
        }

        if (converted) {
            outputDict.push(converted);
        } else {
            outputDict.push(raw);
        }
    });

    outputDict = _.uniq(_.sortBy(outputDict));

    calculateConsonantsVowelsMap(outputDict);

    var stream = fs.createWriteStream("words.txt");
    stream.once('open', function(fd) {

        _.each(outputDict, function(word) {
            stream.write(word + "\n");
        });

        stream.end();
    });
};

var lineReader = require('readline').createInterface({
    input: fs.createReadStream('all_words.txt')
});

lineReader.on('line', function(line) {
    dict.push(line.toLowerCase());
});

lineReader.on('close', clean);