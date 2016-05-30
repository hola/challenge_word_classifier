var recWhile = require('./recwhile');

module.exports = function (array) {

    function genArr(arr) {
        var resultArr = [];

        arr.forEach(function (subArr) {
            var
                start = subArr[0],
                end = subArr[1],
                middle = +(start + (end - start) / 2).toFixed(4),
                minArr = [start, middle],
                maxArr = [middle, end];


            resultArr.push([minArr, maxArr]);
        });

        return resultArr;
    }

    function united(genArr, variantArr) {
        var resultArr = [];

        variantArr.forEach(function (arr) {
            var tmpArr = [];

            genArr.forEach(function (subArr, i) {
                tmpArr.push(subArr[arr[i]]);
            });

            resultArr.push(tmpArr);
        });

        return resultArr;
    }
    
    return united(genArr(array), recWhile(array.length));
};