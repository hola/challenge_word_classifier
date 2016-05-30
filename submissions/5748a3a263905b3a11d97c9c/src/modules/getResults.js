var fs = require('fs');
var result = require('./../results/result.json');

function getResult() {
    var
        maxCount = 0,
        trues = 0,
        falses = 0,
        count = 0;

    result.forEach(function (arr) {
        if (maxCount < arr[0]) {
            maxCount = arr[0];
            trues = arr[1];
            falses = arr[2];
        }

        count += arr[0];
    });

    var middleCount = (count / result.length).toFixed(2);

    console.log('Лучший результат: ' + maxCount + '%', 'Истина: ' + trues, 'Ложь: ' + falses);
    console.log('Средний результат: ' + middleCount + '%');
}

module.exports = getResult;