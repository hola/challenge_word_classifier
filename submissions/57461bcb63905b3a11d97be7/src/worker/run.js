var fs = require('fs');
const readline = require('readline');

var mod = require('./solution.js');


var TEST_FILE = 'all_test_20M.txt';
var USE_ALL_TEST = true;

var bloomTester = require('./testBloom');
var size = 67 * 1024 * 8 - 1;
var seed1 = 2;
var seed2 = 111;

var dictCount = 0;
var dict = {};
var dictFiltered = {};

function filterStat(word, word2) {

    if (dictCount > 13100000) return dict[word] > dictCount / 660000 / 4;

    if (!dict[word]) dict[word] = 0;
    ++dict[word];
    ++dictCount;
    if (dictCount > 660000 * 4) {
        dictFiltered = {};
        return dict[word] > dictCount / 660000 / 4;
    }

    if (!dictFiltered[word2]) dictFiltered[word2] = 0;
    ++dictFiltered[word2];
    return dictFiltered[word2] > dictCount * 3 / 660000 / 4;
}

var filters = [
    ["'s", "s", "ing", "ed", "nesse", "ly", "nes", "ation", "able", "er", "al", "est", "ility", "ate", "like", "ship", "itie", "ville", "les", "ment", "e", "ic", "ou", "ism", "ist", "ology", "ity", "y", "i", "iform", "oid", "ful", "ing"],
    ["un", "non", "over", "super", "inter", "anti", "pre", "sub", "semi", "out", "der", "ps"],
    []
];
//filters = [[],[],[]];
var words = getUnique(fs.readFileSync('words.txt', 'utf8').toLowerCase().split('\n').map(filterCallback).filter(testReg));

fs.writeFileSync('words_filtered.txt', words.sort().join('\n'), 'utf8');

bloomTester.init(words, size, seed1, seed2);

for (var i = 0; i < size / 8 + 5; i++) {
    if (!bloomTester.bits[i]) bloomTester.bits[i] = 0;
}

var buff = Buffer.alloc(bloomTester.bits.length);
for (var i = 0; i < size / 8 + 5; i++) {
    buff[i] = bloomTester.bits[i];
}
fs.writeFileSync('data', buff);

var data = fs.readFileSync('data');
if (mod.init)
    mod.init(data);

//return;

var count = 0;
var acc = 0;
var err = 0;
var acc_bl = 0;
var err_bl = 0;

var acc_0 = 0;
var acc_1 = 0;
var err_0 = 0;
var err_1 = 0;

var acc_bl_0 = 0;
var acc_bl_1 = 0;
var err_bl_0 = 0;
var err_bl_1 = 0;

var acc_diff = 0;

const rl = readline.createInterface({
    input: fs.createReadStream(TEST_FILE, 'utf8')
});
//console.time("readFile");
console.log("Result Accepted Total OK_1 OK_0 Last100K");
rl.on('line', (line) => {
    var arr = line.split('\t');
    if (arr.length == 2 && (USE_ALL_TEST || arr[1] == '0')) {
        var w = filterCallback(arr[0]);
        var r = mod.test(arr[0]);
        var r_stat = filterStat(arr[0], w);
        var r_reg = testReg(w);
        var r_bloom = bloomTester.test(w);
        var r2 = r_stat && r_reg && r_bloom;

        if (r == (arr[1] == '1')) {
            acc++;
        }
        else {
            err++;
        }
        if (r2 == (arr[1] == '1')) {
            acc_bl++;
            acc_0 += arr[1] == '0' ? 1 : 0;
            acc_1 += arr[1] == '1' ? 1 : 0;
        }
        else {
            err_bl++;
            err_0 += arr[1] == '0' ? 1 : 0;
            err_1 += arr[1] == '1' ? 1 : 0;
        }

        count++;

        if (count % 100000 == 0) {
            console.log((acc_bl / count).toFixed(5), acc_bl, count, (acc_1 / (acc_1 + err_1)).toFixed(5), (acc_0 / (acc_0 + err_0)).toFixed(5), ((acc_bl - acc_diff) / 100000).toFixed(5));
            acc_diff = acc_bl;
        }
    }
});
rl.on('close', () => {
    console.log((acc_bl / count).toFixed(5), acc_bl, count, (acc_1 / (acc_1 + err_1)).toFixed(5), (acc_0 / (acc_0 + err_0)).toFixed(5));
    console.log((acc / count).toFixed(5), acc, count);
    //console.timeEnd("readFile");
});

function re(w, s) {
    if (w.endsWith(s)) w = w.slice(0, -1 * s.length);
    return w;
}

function rb(w, s) {
    if (w.startsWith(s)) w = w.slice(s.length, w.length);
    return w;
}

function rm(w, s) {
    return w.split(s).join('');
}

function filterCallback(word) {
    filters[0].forEach(function(end) {
        word = re(word, end);
    });
    filters[1].forEach(function(begin) {
        word = rb(word, begin);
    });
    return word;
}

function testReg(word) {
    if (word.split(/[aeiou]/).filter((w) => {
            return w.length > 4;
        }).length > 0) {
        return false;
    }
    if (word.split(/['ijqy]/).pop().length == 0)
        return false;
    if (word[0] == 'x')
        return false;

    return word.length > 0;
    //return true;
}

function getUnique(arr) {
    var u = {},
        a = [];
    for (var i = 0, l = arr.length; i < l; ++i) {
        if (u.hasOwnProperty(arr[i])) {
            //console.log(arr[i]);
            continue;
        }
        a.push(arr[i]);
        u[arr[i]] = 1;
    }
    return a;
}