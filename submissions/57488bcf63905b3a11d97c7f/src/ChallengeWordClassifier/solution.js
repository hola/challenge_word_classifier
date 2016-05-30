(function() {
    var byteSize = 8;
    var bitsCount;
    var blum = [];
    var hashMin = 0;
    var masks = [];

    var getBit = function(index) {
        var byteIndex = Math.floor(index / byteSize);
        var b = blum[byteIndex];
        var bitIndex = index % byteSize;
        return ((b >> bitIndex) & 1) === 1;
    };

    var makeCRCTable = function() {
        var c;
        var crcTable = [];
        for (var n = 0; n < 256; n++) {
            c = n;
            for (var k = 0; k < 8; k++) {
                c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
            }
            crcTable[n] = c;
        }
        return crcTable;
    };

    var crc32 = function(str) {
        var crcTable = crcTable || makeCRCTable();
        var crc = 0 ^ (-1);
        for (var i = 0; i < str.length; i++) {
            crc = (crc >>> 8) ^ crcTable[(crc ^ str.charCodeAt(i)) & 0xFF];
        }
        return (crc ^ (-1)) >>> 0;
    };

    var getMask = function(w) {
        var m = "";
        for (var i = 0; i < w.length; i++) {
            if ("aeiouy".indexOf(w[i]) >= 0)
                m += "a";
            else if ("bcdfghjklmnpqrstvwxz".indexOf(w[i]) >= 0)
                m += "b";
            else m += w[i];
        }
        return m;
    };

    exports.init = function (data) {
        var blumSize = data.readInt32LE(0);
        hashMin = data.readInt32LE(4);
        for (var i = 8; i < blumSize + 3; i++) {
            blum.push(data.readInt8(i));
        }
        bitsCount = blum.length * byteSize;
        masks = data.toString("ascii", blumSize + 4).split("$");
        for (var i = 1; i < masks.length; i++) {
            var m0 = masks[i-1];
            var m = masks[i];
            var n = parseInt(m) || 0;
            masks[i] = m0.substr(0, m0.length - n) + m.replace(n > 0 ? n.toString() : "", "");
        }
    };

    exports.test = function(w) {
        var indAp = w.lastIndexOf("'");
        if (indAp === w.length - 1) {
            return false;
        }
        var wCut = (indAp >= 0 ? w.substring(0, indAp) : w).replace("'", "");

        var result = w.length < 19;
        result = result && !(w[0] == '\'' || (w.Length > 14 && "jq".indexOf(w[14]) >= 0) || (w.Length > 15 && "jqw".indexOf(w[15]) >= 0) || (w.Length > 16 && "jqw".indexOf(w[16]) >= 0) || (w.Length > 17 && "fjkqw".indexOf(w[17]) >= 0))
            && getBit((crc32(wCut) % 512503) - hashMin)
            && masks.indexOf(getMask(w)) >= 0;
        return result;
    };
})();