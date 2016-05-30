'use strict';

function stdev(values) {
    let average = avg(values);
    let squareDiffs = values.map(value => {
        let diff = value - average;
        return diff * diff;
    });
    let avgSquareDiff = avg(squareDiffs);
    return Math.sqrt(avgSquareDiff);
}

function avg(data) {
    let sum = data.reduce((sum, value) => sum + value, 0);
    return sum / data.length;
}

function min(arr) {
    return arr.reduce((p, v) => p < v ? p : v);
}

function max(arr) {
    return arr.reduce((p, v) => p > v ? p : v);
}

module.exports.min = min;
module.exports.max = max;
module.exports.avg = avg;
module.exports.stdev = stdev;
