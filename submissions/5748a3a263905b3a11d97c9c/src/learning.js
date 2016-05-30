var test = require('./maintest').test;
var genArr = require('./genarr');
var testWords = require('./data/testWords.json');
var fs = require('fs');

testWords.length = 10;

var counter = 0;

checking(genArr([[0, 100], [0, 100], [0, 100], [0, 100], [0, 100], [0, 100], [0, 100], [0, 100], [0, 100], [0, 100]]));

function checking(variableArr) {
    counter++;

    var
        bestResults = 0,
        bestArr = [],
        startTime = +new Date();

    variableArr.forEach(function (minArr) {
        var
            results = [],
            middleResult = 0;

        testWords.forEach(function (obj) {
            var result = 0;

            for (var key in obj) {
                if (obj[key] === test(key, minArr)) {
                    result++;
                }
            }

            results.push(result);
        });

        results.forEach(function (res) {
            middleResult += res;
        });

        middleResult /= results.length;

        if (middleResult > bestResults) {
            bestResults = middleResult;
            bestArr = minArr;
        }
    });

    console.log('==> Тест №' + counter);
    console.log('    Средний результат: ' + bestResults.toFixed(4) + '%');
    console.log('    Массив интервалов: ' + JSON.stringify(bestArr));
    console.log('    Время теста: ' + ((+new Date() - startTime) / 1000 / 60).toFixed(2) + 'м.');
    console.log('----------------------------------------------');

    if (counter < 20) {
        var newArr = genArr(bestArr);

        checking(newArr);
    }
}
