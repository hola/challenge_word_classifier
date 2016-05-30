function Bloom(size, functions, initbits) {
    var bits = Bits(initbits);
    function test(string) {
        for (var i = 0; i < functions.length; ++i)
            if (!bits.test(functions[i](string) % size)) return false;
        return true;
    }
    return {test: test};
}

function OptimalBloom(max_members, error_probability,initbits) {
    var size = 3171149;
    var count = 47;
    var startSeed = 30;
    var seedStep = 3;
    var functions = [];
    for (var i = 0; i < count; ++i){
      var seed = startSeed + seedStep * i;
      functions[i] = Hash(seed);
    }
    return Bloom(size, functions, initbits);
}

function Hash(seed){
    return function (string)    {
        var result = 1;
        for (var i = 0; i < string.length; ++i)
            result = (seed * result + string.charCodeAt(i)) & 0xFFFFFFFF;
    return result;
    };
}

function Bits(bits){
    function test(index) {
        return (bits[Math.floor(index / 32)] >>> (index % 32)) & 1;
    }
    return {test: test};
}

var words;
exports.init = (data) => {
    initbits = data.split(',');
    words = OptimalBloom(661686, 0.1, initbits);
}

exports.test = (word) => {
    return words.test(word.toLowerCase());
}