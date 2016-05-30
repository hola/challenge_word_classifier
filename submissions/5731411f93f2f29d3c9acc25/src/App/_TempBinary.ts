
function smoothBinary(str) {
    var delta = bitForAlphabetChar - str.length;
    for(var i = 0; i <= delta; i++) { str = "0" + str; }
    return str;
}

function convertToBinary(str) {
    var newBinaryString = [];
    var alphabet = {
        "a": 0x1, "b": 0x2, "c": 0x3, "d": 0x4, "e": 0x5, "f": 0x6, "g": 0x7, "h": 0x8,
        "i": 0x9, "j": 0x10, "k": 0x11, "l": 0x12, "m": 0x13, "n": 0x14, "o": 0x15, "p": 0x16,
        "q": 0x17, "r": 0x18, "s": 0x19, "t": 0x20, "u": 0x21, "v": 0x22, "w": 0x23, "x": 0x24,
        "y": 0x25, "z": 0x26, ":": 0x27, "'": 0x28, ";": 0x29, ",": 0x30
    };

    for(var i = 0; i < str.length; i++) {
        var char = str.charAt(i);
        if(char !== "\n") {
            var byte = smoothBinary(alphabet[char].toString(2));
            newBinaryString.push(byte);
        }
    }

    str = newBinaryString.join("");
    return strToBinary(str);
}

function strToBinary(str) {
    var out = "";
    var totalFullBytes = Math.floor(str.length / 8);
    var residueLength = str.length - (totalFullBytes * 8);
    var residue;

    if(residueLength > 0) {
        residue = String.fromCharCode(parseInt(smoothBinary(str.substr(totalFullBytes + 1, residueLength)), 2));
    }

    for(var i = 0; i < totalFullBytes; i++) {
        out += String.fromCharCode(parseInt(str.substr(8 * i, 8), 2));
    }

    if(residueLength > 0) {
        out += residue;
    }

    return out;
}