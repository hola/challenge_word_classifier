var classify = require('./classify.js');
var request = require('request');
var zlib = require('zlib');
var fs = require('fs');

console.log("Testing...");

var words,
    decisions = [],
    score,
    misses = [];

var fetchWords = function() {
    request('https://hola.org/challenges/word_classifier/testcase',
        function(error, response, body) {

            console.log(response.request.uri.href);

            try {
                words = JSON.parse(body);
            } catch(e) {
                console.log(e);
                console.log(body);
                return;
            }

            var whitelistBuffer = fs.readFileSync('./whitelist.json.gz');
            var whitelist = zlib.gunzipSync(whitelistBuffer);
            classify.init(whitelist);

            for (var word in words) {
                decision = classify.test(word);
                correct = (decision == words[word]);
                decisions.push(+ correct );
                if (!correct) {
                    misses.push(word+' ['+words[word]+']');
                }
            }

            score = decisions.reduce(function(previousValue, currentValue, currentIndex, array){
                return previousValue + currentValue;
            });

            console.log("misses: ", misses);
            console.log("score: ", score);

        }
    );

};

fetchWords();