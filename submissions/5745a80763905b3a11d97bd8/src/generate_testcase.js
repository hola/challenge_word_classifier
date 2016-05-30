'use strict'; /*jslint node:true*/
const fs = require('fs');
const vm = require('vm');
const zlib = require('zlib');
var readline = require('readline');

function main(words, testcases, num_testcase){
    if (!testcases || !words)
    {
        console.log('Usage: node WORD_DIR TESTCASE_DIR NUM_TESTCASE');
        return 1;
    }
    if (process.version!='v6.0.0')
    {
        console.error('This script must be run in Node.js v6.0.0');
        return 1;
    }
    var all_valid_words = [];
    var rd = readline.createInterface({
        input: fs.createReadStream(`${words}/words.txt`),
        output: process.stdout,
        terminal: false
    });
    rd.on('line', function(word) {
        all_valid_words.push(word.toLowerCase());
    });
    rd.on('close', function(){
        console.log("Done load words. Begin to generate testcase");
        for(var time = 0; time < num_testcase; time++) {
            var testcase_word = {};
            console.log('Generate testcase time:' + time);
            var valid_20_words = getValidWord(all_valid_words, 50);
            for(var i = 0; i < valid_20_words.length; ++i) {
                var invalid_words = getInvalidWord(all_valid_words, valid_20_words[i], 1);
                testcase_word[valid_20_words[i]] = true;
                for(var j = 0; j < invalid_words.length; ++j) {
                    testcase_word[invalid_words[j]] = false;
                }
            }
            var path = testcases + 'testcase_' + time + '.txt';
            console.log('Write testcase to:' + path);
            fs.writeFileSync(path, JSON.stringify(testcase_word));
        }
    });
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function getValidWord(valid_words, num) {
    var words = [];
    while(true) {
        var index = getRandomInt(0, valid_words.length);
        var word = valid_words[index];
        if(words.indexOf(word) == -1)
            words.push(word);
        if(words.length >= num) {
            break;
        }
    }
    return words;
}

function getAllAsciiCharacters(character) {
    var result = [];
    for(var i = 97; i <= 122; i++) {
        if(String.fromCharCode(i) != character) {
            result.push(String.fromCharCode(i));
        }
    }
    return result;
}

function getInvalidWord(valid_words, word, num) {
    var words = [];
    for(var i = 0; i < word.length; i++) {
        var ascii_characters = getAllAsciiCharacters(word[i]);
        for(var j = 0; j < ascii_characters.length; j++) {
            var new_word = word.replace(word[i], ascii_characters[j]);
            if(valid_words.indexOf(new_word) == -1) {
                words.push(new_word);
                if(words.length >= num) {
                    break;
                }
            }
        }
        if(words.length >= num) {
            break;
        }
    }
    return words;
}

main(process.argv[2], process.argv[3], process.argv[4])