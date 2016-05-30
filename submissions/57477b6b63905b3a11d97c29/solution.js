var Theta = [];
var inputSize = 300;
var outputSize = 1;
var hiddenSize = 25;
var hiddenNum = 2;
var vSize = 5;

function getVectorOf(num) {
    var ret = [];
    var binStr = num.toString(2);
    for (var j = 0; j < binStr.length; j++) {
        ret.push(parseInt(binStr[j]));
    }
    for (var j = binStr.length; j < vSize; j++) {
        ret.unshift(0);
    }
    return ret;
}
function toVectorInput(word) {
    var input = [];
    var i = 0;
    for (; i < word.length; i++) {
        if (word[i] === '\'') {
            input = input.concat([1,1,1,1,1]);
            continue;
        }
        input = input.concat(getVectorOf(word.charCodeAt(i) - 'a'.charCodeAt(0) + 1));
    }
    for (; i < 60; i++) {
        input = input.concat([0,0,0,0,0]);
    }
    return input;
}
function sigmoid(val) {
    return 1.0 / (1 + Math.exp(-val));
}
function getOutput(theta, input) {
    var output = [];
    input.unshift(1.0);
    var outSize = theta.length / input.length;
    for (var i = 0; i < outSize; i++) {
        var sum = 0;
        for (var j = 0; j < input.length; j++) {
            sum += input[j] * theta[j * outSize + i];
        }
        output.push(sigmoid(sum));
    }
    return output;
}
function runWord(word, prev) {
    var input = toVectorInput(word);
    var output = input;
    for (var t = 0; t < Theta.length; t++) {
        output = getOutput(Theta[t], output, prev);
    }
    return output[0] > 0.5;
}
module.exports.init = function(data) {
    var pos = 0;
    for (var i = 0; i < hiddenNum + 1; i++) {
        var strLen = i == hiddenNum ? outputSize : hiddenSize;
        var colLen = i == 0 ? inputSize : hiddenSize;
        var tmp = [];
        for (var j = pos; j < pos + strLen * (colLen + 1); j++) {
            var value = data.readDoubleBE(Float64Array.BYTES_PER_ELEMENT * j);
            tmp.push(value);
        }
        Theta.push(tmp);
        pos += strLen * (colLen + 1);
    }
}
module.exports.test = function(word) {
    return word.length > 60 ? false : runWord(word);
}
