let dataDir = 'data/';
let fs = require('fs');
let zlib = require('zlib');

let readTestCases = function(start=0, step=1, max=1000000) {
    let dataFiles = fs.readdirSync(dataDir);
    let result = [];
    let count = Math.min(dataFiles.length, max);
    for (var i = start; i < count; i += step) {
        let data = JSON.parse(
            fs.readFileSync(dataDir + dataFiles[i], {encoding: 'utf8'})
        );
        result.push(data);
    };
    return result;
};


let readWordList = function() {
    return fs.readFileSync('words.txt', {encoding: 'utf8'}).split("\n");
};


let testImpl = function(callback) {
        let testCases = readTestCases(0, 1, 3000);

        let tested = 0;
        let correct = 0;
        let false_pos = 0;
        let false_neg = 0;

        for (let i = 0; i < testCases.length; i++) {
            let testCase = testCases[i];
            let keys = Object.keys(testCase);
            for (var j = 0; j < keys.length; j++) {
                let key = keys[j];
                let value = testCase[keys[j]];

                tested++;
                if (callback(key) == value) {
                    correct++;
                } else {
                    if (value) {
                        // console.log(`!${key}`)
                        false_neg++;
                    } else {
                        false_pos++;
                    }
                };
            };
        };

        return {tested, correct, false_pos, false_neg};
};


let main = function(op='', module='bloom') {
    console.log(`Using the classifier "${module}"`);
    let classifier = require("./classifier_" + module);

    if (op == 'learn') {
        let words = readWordList();

        classifier.generate(words);
        classifier.dump();

        return true;
    } else if (op == 'test') {
        let data = zlib.gunzipSync(fs.readFileSync(classifier.filename));

        classifier.init(data);

        let testRes = testImpl(function(word) {
            return classifier.test(word);
        });

        console.log(testRes);
        console.log(testRes.correct / testRes.tested);

        return true;
    } else {
        console.log('Unknown operation: "' + op + '"');
        return false;
    }
};


let status = main(process.argv[2], process.argv[3]);
if (!status) {
    process.exit(1);
};
