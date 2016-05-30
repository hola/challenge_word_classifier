var reducerClass = require('./reducer');
var reducer = new reducerClass();
var fs = require('fs');
var cryptHandler = require('./cryptHandler');
var crypto = new cryptHandler();

// STEP 1 - PATTERNS
fs.readFile('words.txt', 'utf8', function (err, data) {
    if (err) {
        return console.log(err);
    }

    var dictionary = data.split('\n');
    var encryptedDictionary = crypto.init(dictionary);

    fs.writeFile("results/patterns.txt", encryptedDictionary, function(err) {
        if(err) {
            return console.log(err);
        }

        console.log('dictionary length:', dictionary.length);
        console.log('encrypted dictionary length:', encryptedDictionary.length);
    });

});



// # STEP 2 - GROUPS
fs.readFile('results/patterns.txt', 'utf8', function (err, data) {
    if (err) {
        return console.log(err);
    }

    var encryptedWords = data.split(',');

    var aGroups = reducer.groupWords(encryptedWords,4);

    console.log('GROUPS TOTAL:', aGroups.length,Date());

    var groups = JSON.stringify(aGroups);


    fs.writeFile("results/groups.txt", groups, function(err) {
        if(err) {
            return console.log(err);
        }

        console.log('FINISHED:', Date());
    });

});

// STEP 3 & 4- TREES AND REGEX
fs.readFile('results/groups.txt', 'utf8', function (err, data) {
    if (err) {
        return console.log(err);
    }

    console.log('STARTING:', Date());

    var groups = JSON.parse(data);

    var regexs = reducer.regexsForGroups(groups);

    var result = JSON.stringify(regexs);

    fs.writeFile("regex.txt", result, function(err) {
        if(err) {
            return console.log(err);
        }
        console.log('FINISHED:', Date());
    });

});

