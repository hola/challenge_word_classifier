var tree = [];
var data;
var i = 0;
var nodes = 0
function restore_tree (node, offset) {
    nodes += 1;
    var b1 = (data[offset / 8 | 0] >> (8 - (offset % 8) - 1)) & 1
    var b0 = (data[offset / 8 | 0] >> (8 - (offset % 8) - 2)) & 1

    offset += 2
    if (b1) {
        node["1"] = {};
        offset = restore_tree(node[1], offset);
    }

    if (b0) {
        node["0"] = {};
        offset = restore_tree(node[0], offset);
    }
    return offset
}

function word_to_bits(word) {
    var len = Math.min(Math.max(word.length - 6, 0), 7).toString(2);
    while (len.length < 3) { len = '0' + len; }

    var res = len + word.split("").
        map(function (i) { return i.match(/[qxwkyghmulrnae]/) ? "1" : "0" }).
        join("");

    return res.substring(0,25)
}

function init(d) {
    data = d;
    restore_tree(tree, 0);
}

function check_tree(bits, node) {
    if (bits == "") return true;

    b = bits[0];

    return (node[b] != undefined) && check_tree(bits.substring(1), node[b])
}

function check_hash(word) {
    // calc hash
    var chrs = "abcdefghijklmnopqrstuvwxyz'";
    var size = 585000;
    var offset = 21472 * 8;
    var buf = word.substring(0,5).split("").
        map( function(i) { return chrs.indexOf(i); });
    var sum = 0;
    for (i = 0; i < buf.length; i++) { 
        sum = sum * 27 + buf[i] + 1;
    }
    sum -= 1;
    while (sum > size) { sum = (sum / size | 0 ) + (sum % size) }

    // check hash
    console.log("hash = ", sum);
    var offset = offset + sum;
    return true == ((data[offset / 8 | 0] >> (8 - (offset % 8) - 1)) & 1)
}

function check_expr(word) {
    return word.charAt(0) != "'" &&
        !word.match(/''/) &&
        !word.match(/[^aoeyiu]{5,}/) &&
        !word.match(/[qjv][bcdfghjklmnpqrstvwxyz]{2}/) &&
        !word.match(/qq/);
}

function test(word) {
    console.log("Checking ", word);
    var t = check_tree(word_to_bits(word), tree);
    var h = check_hash(word);
    var e = check_expr(word);
    return t  && h && e;
}

module.exports.init = init;
module.exports.test = test;
