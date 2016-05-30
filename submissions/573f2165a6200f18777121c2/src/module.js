d = [];

var unpack = function(code) {
    var tmp = code.charCodeAt(0);
    var real = tmp & 31;
    real = real == 0 ? 39 : real + 96;
    return {
        lvl: ((tmp & (3 << 5)) >> 5) + 1,
        chr: String.fromCharCode(real),
        last: (tmp & (1 << 7)) >> 7
    };
}
var get_hash = function(str) {
    var hash = 0;
    for(var i = 0; i < str.length; i++) {
        var ch = str[i];
        for(var j = 3; j < 8; j++) {
            var code = ch.charCodeAt(0);
            hash ^= ((code == 39 ? 0 : code - 96) >> j);
            hash &= ~(254);
        }
    }
    return (hash & 1) != 0;
}

exports.init = function(data) {
    var dataStr = data.toString('binary');
    var dictsStr = dataStr.substring(0, dataStr.length - 7491),
        packed = dataStr.substring(dataStr.length - 7491);

    var dictsArr = [], j = 0, hIter = 0;
    for(var i = 0; i < dictsStr.length; i++) {
        if(dictsStr[i].charCodeAt(0) == 255) {
            j++;
            continue;
        }
        if(!dictsArr[j])
            dictsArr[j] = [];
        dictsArr[j].push(dictsStr[i]);
    }
    var hashes = [];
    for(var i = 0; i < packed.length; i++) {
        for(var j = 0; j < 8; j++) {
            hashes[i * 8 + j] = (packed[i].charCodeAt(0) & (1 << j)) != 0;
        }
    }

    for(var k = 0; k < dictsArr.length; k++) {
        var dict = dictsArr[k];
        var tree = {}, prevNode, currNode = tree,
            prevLvl = 1, prevNodes = { 0: tree };

        for(var i = 0; i < dict.length; i++) {    
            var unpacked = unpack(dict[i]),
                lvl = unpacked.lvl, chr = unpacked.chr, last = unpacked.last;
            if(lvl != prevLvl)
                currNode = lvl > prevLvl ? prevNodes[prevLvl] : prevNodes[lvl - 1];
            currNode[chr] = last ? { 0: hashes[hIter++] } : {};
            prevLvl = lvl;
            prevNodes[lvl] = currNode[chr];
        }
        d[k] = tree;
    }
}

exports.test = function(str, debug) {
    debug = debug || false;
    var j = 0;
    var currNode = d[j], next_switch = 4, frmStr = str.replace(/\'s$/, "");
    for(var i = 0, len = frmStr.length; i < len; i++) {
        if(i == next_switch) {
            currNode = d[++j];
            next_switch = --i + 4;
        }
        if(currNode && currNode[frmStr[i]])
            currNode = currNode[frmStr[i]];
        else
            return false;
    }
    return currNode[0] != null && (!currNode[0] || (currNode[0] && get_hash(frmStr)));
}