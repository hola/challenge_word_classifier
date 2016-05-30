const value_empty = 0x80;       // empty child
const value_last = 0x40;        // this node is last child
const value_end_word = 0x20;    // end word
const max_chars = 27;

var statTotal = [0, 0, 0];

function StatNode() {
    return {
        children: new Array(max_chars),
        total: 0,
        empty: true
    };
}

function WordNode() {
    return {
        children: new Array(max_chars),
        empty: true,
        endWord: true
    };
}

var statTree = new StatNode();
var wordsTree = new WordNode();

function GetStatMax(node) {
    var result = 0;
    for (var i = 0; i < max_chars; i++) {
        if (node.children[i] && node.children[i].total > result) {
            result = node.children[i].total;
        }
    }
    return result;
}

function NormalizeChildren(node, maxVal) {
    for (var i = 0; i < max_chars; i++) {
        if (node.children[i]) {
            node.children[i].total /= maxVal;
        }
    }
}

function ReadStatReq(node, data, offset) {
    for (var i = 0; i < max_chars; i++) {
        var u32 = data.readUInt32LE(offset);
        node.children[i] = new StatNode();
        node.children[i].total = u32 & 0x00ffffff;
        node.children[i].empty = (u32 & (value_empty << 24)) != 0;
        offset += 4;
    }

    for (var i = 0; i < max_chars; i++) {
        if (!node.children[i].empty) {
            offset = ReadStatReq(node.children[i], data, offset);
        }
    }
    return offset;
}

function ReadWordsReq(node, data, offset) {
    var lastChild = false;
    do {
        var u8 = data.readUInt8(offset);
        var newNode = node.children[(u8 & 0x1F)] = new WordNode();
        lastChild = (u8 & value_last) != 0;
        newNode.empty = (u8 & value_empty) != 0;
        newNode.endWord = (u8 & value_end_word) != 0;

        offset++;
    } while (!lastChild);

    for (var i = 0; i < max_chars; i++) {
        if (node.children[i] && !node.children[i].empty) {
            offset = ReadWordsReq(node.children[i], data, offset);
        }
    }
    return offset;
}

function addStatistic(stats, word, pos, len) {
    var curNode = stats;
    for (var i = pos; i < pos + len; i++) {
        var ch = word[i];

        // add node to tree
        if (!curNode.children[ch]) {
            curNode.children[ch] = new StatNode();
        }

        curNode.empty = false;
        curNode = curNode.children[ch];

        if (i == pos + len - 1) {
            statTotal[len - 1]++;
            curNode.total++;
        }
    }
}

function CalculateDiffReq(nodeOne, nodeTwo, lvl) {
    var res = [0, 0];
    if (nodeOne.total > 0) {
        var val = nodeOne.total * 1000000 / statTotal[lvl];
        if (nodeTwo.total > 0) {
            res[0] = Math.abs(val - nodeTwo.total);
        } else {
            res[0] = val;
        }
        res[1] = 1;
    }
    for (var i = 0; i < max_chars; i++) {
        if (nodeOne.children[i] && nodeTwo.children[i]) {
            var subRes = CalculateDiffReq(nodeOne.children[i], nodeTwo.children[i], lvl + 1);
            res[0] += subRes[0];
            res[1] += subRes[1];
        }
    }
    return res;
}

module.exports = {
    init: function (data) {
        // read trees
        var offset = ReadWordsReq(wordsTree, data, ReadStatReq(statTree, data, 0));
    },
    test: function (word) {
        var curNode = wordsTree;
        var stats = new StatNode();
        var wordCodes = [];

        for (var i = 0, j = word.length; i < j; i++) {
            var ch = word[i] == "'" ? 0 : word.charCodeAt(i) - 'a'.charCodeAt(0) + 1;
            wordCodes.push(ch);
        }

        // test begin
        for (var i = 0, j = wordCodes.length; i < j; i++) {
            if (curNode) {
                var ch = wordCodes[i];
                if (!curNode.empty && !curNode.children[ch]) {
                    return false;
                }
                // small words
                if ((i == j - 1) && curNode.children[ch].endWord) {
                    return true;
                }
                curNode = curNode.children[ch];
            }
            // add stat
            addStatistic(stats, wordCodes, i, 1);

            if (j - i > 1) {
                addStatistic(stats, wordCodes, i, 2);

                if (j - i > 2) {
                    addStatistic(stats, wordCodes, i, 3);
                }
            }

        }

        // calculate result
        var resRaw = CalculateDiffReq(stats, statTree, -1);

        return resRaw[0]/(1000000 * resRaw[1]) <= 0.1;
    }
}