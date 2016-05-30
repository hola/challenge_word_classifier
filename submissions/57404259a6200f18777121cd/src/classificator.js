(function (Math) {
    "use strict";

    exports['init'] = init;
    exports['test'] = test;

    const bytesCount = 69100;
    let buffer;

    const alphabet = "0abcdefghijklmnopqrstuvwxyz'";

    function init(buf) {
        buffer = buf;
    }

    function test(word) {
        word = word.toLowerCase();
        const l = word.length;
        if (l < 2) return word.indexOf("'") == -1;
        if (l > 14) return false;
        return testWord(word);
    }

    function testWord(text) {
        var bit = hash(text, bytesCount * 8);
        return getBit(bit);
    }

    function charToIndex(char) {
        const index = alphabet.indexOf(char);
        return index != -1 ? (index + 1) : 1;
    }

    function getBit(bit) {
        var byte = (bit / 8) | 0;
        var localBit = bit % 8;
        var value = buffer.readUInt8(byte);
        value &= 1 << localBit;
        return !!value;
    }

    function hash(text, m) {
        var hash = Math.abs(djb2(text)) % m;
        return hash;
    }

    function djb2(text) {
        var hash = 5381;
        for (var i = 0; i < text.length; i++) {
            hash = ((hash << 5) + hash) ^ charToIndex(text[i])/*text.charCodeAt(i)*/;
        }
        return hash;
    }

})
(Math);
