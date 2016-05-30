function Bits()
{
    var data = [];

    function test(index) {
        return (data[Math.abs(Math.floor(index / 32))] >>> (index % 32)) & 1;
    }

    function set(index)
    {
        data[Math.abs(Math.floor(index / 32))] |= 1 << (index % 32);
    }

    return {test: test, set: set, data: data};
}

function Hash(seed)
{
    return function (string) {
        var result = 1;
        for (var i = 0; i < string.length; ++i)
            result = (seed * result + string.charCodeAt(i)) & 0xFFFFFFFF;
        return result;

    };
}

function Bloom(size, functions) {
    var bits = Bits();

    function add(string)
    {
        for (var i = 0; i < functions.length; i ++)
            bits.set(functions[i](string) % size);
    }

    function test(string)
    {
        for (var i = 0; i < functions.length; i ++)
            if (!bits.test(functions[i](string) % size)) return false;
        return true;
    }

    return {add: add, test: test, bits: bits};
}




var optimalBloomBits = function(error_probability, words, min, max) {
    var size = -(words.length * Math.log(error_probability)) / (Math.LN2 * Math.LN2);
    var count = (size / words.length) * Math.LN2;

    size = Math.round(size) ;
    count = Math.round(count);
    if (count < 1) {
        count = 1;
    }
    //count = 1;

    var functions = [];
    var seeds = [];
    for (var i = 0; i < count; ++i) {
        var seed = Math.floor(Math.random() * 32) + 32;
        seeds.push(seed);
        functions[i] = Hash(seed);
    }
    var bloom = Bloom(size, functions);

    for (var i = 0; i < words.length; ++i) {
        bloom.add(words[i]);
    }


    return [{seeds: seeds, size: size, min: min, max: max}, bloom, [].slice.call(bloom.bits.data.map(function(v){return -1 * v;}))];
};


module.exports = optimalBloomBits;
