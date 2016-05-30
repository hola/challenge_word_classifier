var bits;
module.exports.init = function(words, size, seed1, seed2) {
    bits = []; //Buffer.alloc(Math.floor(size / 8)+1);

    module.exports.bits = bits;

    var bloomTester = Bloom(size, [Hash(seed1), Hash(seed2)]);

    for (var i = 0; i < words.length; i++) {
        bloomTester.add(words[i]);
    }
    module.exports.test = function(word) {
        return !!bloomTester.test(word);
    };

};

function Bits() {


    function test(index) {
        return (module.exports.bits[Math.floor(index / 8)] >>> (index % 8)) & 1;
    }

    function set(index) {
        module.exports.bits[Math.floor(index / 8)] |= 1 << (index % 8);
    }

    return {
        test: test,
        set: set
    };
}

function Hash(seed, size) {

    return function(string) {
        var result = 1;
        for (var i = 0; i < string.length; ++i) {
            result = (seed * result + string.charCodeAt(i)) & 0x7FFFFFFF;
           //if (result < 0) result += 0xFFFFFFFF;
        }
        if (result < 0) console.log(string, result);
        return result;
    };
}

function Bloom(size, functions) {
    var bits = Bits();

    function add(string) {
        for (var i = 0; i < functions.length; ++i)
            bits.set(functions[i](string) % size);
    }

    function test(string) {
        for (var i = 0; i < functions.length; ++i)
            if (!bits.test(functions[i](string, size) % size)) return false;
        return true;
    }

    return {
        add: add,
        test: test
    };
}