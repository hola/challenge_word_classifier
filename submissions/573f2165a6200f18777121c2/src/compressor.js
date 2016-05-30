var fs = require('fs'),
    Set = require("collections/set"),
    util = require('util');

START_PART_SIZE = 1;
START_DICT_SIZE = 4;
LETTER_OFFSET = 96;
LEVEL_MULTIPLIER = 30;

DIVIDER = String.fromCharCode(255);

var contents = fs.readFileSync('words.txt');

var trim_s = function(str) {
    return str.replace(/\'s$/, "");
}

var charToCode = function(char) {
    var code = char.charCodeAt(0), resCode;
    if(code == 39)
        resCode = 0;
    else
        resCode = code - LETTER_OFFSET;
    return parseInt(resCode);
}

var convert = function(char, extra) {
    extra = extra || 0;
    var resCode = charToCode(char);
    return String.fromCharCode(resCode | extra);
}

var get_hash = function(str) {
    var hash = 0;
    for(var i = 0; i < str.length; i++) {
        var ch = str[i];
        for(var j = 3; j < 8; j++) {
            hash ^= (charToCode(ch) >> j);
            hash &= ~(254);
        }
    }
    return hash & 1;
}

var trees = {}, currNode;
contents.toString().split('\n').forEach(function(line) {
    var fullFrmStr = line.toLowerCase().trim(),
        frmStr = trim_s(fullFrmStr), str,
        part_size = START_PART_SIZE, dict_size = START_DICT_SIZE;

    var hash = get_hash(frmStr);

    var j = 0;
    do {
        str = frmStr.substring(j, j + dict_size);
        if(!trees[j])
            trees[j] = { };

        currNode = trees[j];
        for (var i = 0, len = str.length; i < len; i += part_size) {
            var part = str.substring(i, i + part_size).trim();
            if(part.length == 0)
                continue;
            if(!currNode[part])
                currNode[part] = { count: 1 };
            else
                currNode[part]['count']++;
            currNode = currNode[part];
        }
        if(i != j + dict_size || frmStr.length == j + dict_size) {
            if(currNode['_']) {
                currNode['_']['hash'] &= hash;
            } else {
                currNode['_'] = {
                    last: true,
                    hash: hash
                }
            }
        }
        j += dict_size - 1;
        dict_size = 4;
    } while(j < frmStr.length);
});

var result = "", hashes = [], t = 0, f = 0;
var packNode = function(node, level) {
    var extra = level << 5,
        branch = "";
    for(var key in node) {
        if(node[key].last !== undefined || node[key]['count'] <= 2 || !isNaN(node[key]))
            continue;

        var tmpNode = node[key], offset = 0;
        if(tmpNode['_']) {
            hashes.push(tmpNode['_']['hash']);
            offset = 1 << 7;
        }
        var childs = packNode(tmpNode, level + 1);
        if(childs.length > 0 || (childs.length == 0 && level == 3) || offset > 0) {
            branch += convert(key, extra | offset) + childs;
        }
    }
    return branch;
}

for(var key in trees) {
    var nodeResult = packNode(trees[key], 0);
    result += nodeResult;
    if(nodeResult.length > 0)
        result += DIVIDER;
}

var packed = [];
for(var i = 0; i < hashes.length; i++) {
    var offset = i % 8, ind = Math.floor(i / 8);
    packed[ind] |= hashes[i] << offset;
}
for(var i = 0; i < packed.length; i++) {
    result += String.fromCharCode(packed[i]);
}

console.log(util.format("Hashes(len) %d", packed.length))
console.log(util.format("All(len) %d", result.length));

fs.writeFile("result.txt", result, 'binary');