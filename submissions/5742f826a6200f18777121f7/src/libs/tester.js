/**
 *
 */
var fs = require('fs');

(function () {
    'use strict';

    var testFunction, testResultName;
    var logging = true;

    var tester = function (testFunc, testName, needLog) {
        testFunction = testFunc;
        testResultName = testName;
        logging = needLog;
    };

    tester.prototype = {
        run: runTest
    };

    if (typeof exports !== 'undefined') {
        module.exports = tester;
    }
    ///

    function runTest(pathToTest, saveResultDir) {

        var testFileList = fs.readdirSync(pathToTest);
        var shortResult = prepareShortResult(5);
        var fullResult = [];
        var fullResultWrong = [];

        var cnt = 1;

        testFileList.forEach(function (testFile) {
            if (logging && (cnt % 100 === 0)) {
                console.log(testFile);
            }

            cnt++;

            var testData = JSON.parse(fs.readFileSync(pathToTest + '/' + testFile));

            for (var word in testData) {
                if (testData.hasOwnProperty(word)) {
                    var functionResult = testFunction(word);

                    var resultTxt = ['"' + word + '"'];
                    resultTxt.push(testData[word]);
                    resultTxt.push(functionResult);

                    fullResult.push(resultTxt);
                    if (functionResult != testData[word]) {
                        fullResultWrong.push(resultTxt);
                    }

                    shortResult[0][(functionResult === testData[word]).toString()]++;
                }

            }
        });

        fs.writeFile(saveResultDir + '/' + testResultName + '.txt', fullResult.join('\n'));
        fs.writeFile(saveResultDir + '/' + testResultName + '_wrong.txt', fullResultWrong.join('\n'));

        return shortResult;
    }

    function prepareShortResult(numberOfCheckers) {
        numberOfCheckers = numberOfCheckers || 1;
        var shortResult = [];
        for (var i = 0; i < numberOfCheckers; i++) {
            shortResult[i] = {
                'true' : 0,
                'false': 0
            }
        }

        return shortResult;
    }

}());

