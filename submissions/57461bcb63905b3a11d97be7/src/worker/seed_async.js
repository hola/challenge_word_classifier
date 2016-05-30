const fs = require('fs');
const zlib = require('zlib');
var bloomTester = require('./testBloom');

var SIZEBLOOM = 67 * 1024 * 8 - 1;

var SEED1 = 2;
var SEED2 = 90;

var USE_ALL_TEST = true;

var COL_E = 0.001;
var COL_B = 0.001;
var COL_M = 0.001;

var DIFF = 0.0001;

var chars = "abcdefghijklmnopqrstuvwxyz'";

var filters = [["'s", "s", "ing", "ed", "nesse", "ly", "nes", "ation", "able", "er", "al", "est", "ility", "ate", "like", "ship", "itie", "ville", "les", "ment", "e", "ic", "ou", "ism", "ist", "ology", "ity", "y", "i", "iform", "oid", "ful", "ing"], ["un", "non", "over", "super", "inter", "anti", "pre", "sub", "semi", "out", "der", "ps"], []];


var words = fs.readFileSync('words.txt', 'utf8').toLowerCase().split('\n').map(getFilter(filters)).filter(testReg);
var tests = fs.readFileSync('all_test_1M.txt', 'utf8').split('\n');
tests.length = tests.length - 1;

// var ch = {};
// words.forEach(function (w) {
//     var c = w[w.length - 1];
//     if (!ch[c]) ch[c] = 0;
//     ch[c]++;
// });
// for (var i = 0; i < chars.length; i++) {
//     if (ch[chars[i]]) console.log(chars[i], ch[chars[i]]);
//     else console.log(chars[i], 0);
// }

tests = tests.map((w) => {
    var a = w.split('\t');
    if (w == "") console.log('EMPTY');
    a[0] = filterCallback(a[0], filters);
    a[1] = a[1] == '1';
    return a;
});

if (!USE_ALL_TEST) {
    tests = tests.filter((a) => {
        return !a[1];
    });
}

var cluster = require('cluster');

var MIN_SEED = 0;
var MAX_SEED = 128;

function testReg(word) {
    if (word.split(/[aeiou]/).filter((w) => {
        return w.length > 4;
    }).length > 0) {
        return false;
    }
    return true;
}
function test(word) {
    return testReg(word) && bloomTester.test(word);
}

var clusterHandler;
function messageClusterHandler(worker, message, handle) {
    return clusterHandler(worker, message, handle);
}
if (cluster.isMaster) {
    console.log(SIZEBLOOM, SEED1, SEED2);
    var r = runTest(SIZEBLOOM, SEED1, SEED2);
    console.log(r, r.accepted / r.tests);
}
//return;

function runTest(size, seed1, seed2) {
    bloomTester.init(words, size, seed1, seed2);

    var count = 0;
    var acc = 0;
    for (var t = 0; t < tests.length; t++) {
        var arr = tests[t];

        if (test(arr[0]) == arr[1]) {
            acc++;
        }
        count++;

    }

    return {
        tests: count,
        accepted: acc
    };
}


function runStep(size, seed1, seed2, bestBloom, mode) {
    var bestS1 = 0;
    var bestS2 = 0;
    var tBloom = 0;
    var tBest;
    var tasks = 0;
    clusterHandler = function (worker, message, handle) {

        var p = message.accepted / message.tests;

        if (p > tBloom) {
            tBloom = p;
            tBest = message;
            bestS1 = message.task.SEED1;
            bestS2 = message.task.SEED2;
            console.log("BEST Test: " + JSON.stringify(tBest) + " - " + p);
        }
        if (seed1 < MAX_SEED) {
            var task = { SIZEBLOOM: size, SEED1: seed1, SEED2: seed1 };
            worker.send(task);
            seed1++;
        } else if (seed2 < MAX_SEED) {
            var task = { SIZEBLOOM: size, SEED1: bestS1, SEED2: seed2 };
            worker.send(task);
            seed2++;
        } else {
            tasks--;
        }

        if (tasks == 0) {
            console.log("****** BEST Test: " + JSON.stringify(tBest) + " - " + (tBest.accepted / tBest.tests));
            process.exit();
        }
    };
    for (var id in cluster.workers) {
        var task = { SIZEBLOOM: size, SEED1: seed1, SEED2: seed1 };
        cluster.workers[id].send(task);
        seed1++;
        tasks++;
    }
}

if (cluster.isMaster) {
    const numCPUs = require('os').cpus().length - 1;
    for (var i = 0; i < numCPUs; i++) {
        var cl = cluster.fork();
    }

    cluster.on('message', messageClusterHandler);

    runStep(SIZEBLOOM, MIN_SEED, MIN_SEED, 0, 0);

}

if (cluster.isWorker) {
    process.on('message', messageHandler);
}

function messageHandler(task) {
    var arg = task;//JSON.parse(task);

    var r = runTest(arg.SIZEBLOOM, arg.SEED1, arg.SEED2);
    delete arg.filters;
    r.task = arg;
    //var rez = JSON.stringify(r);
    console.log((r.accepted / r.tests).toFixed(5) + " - " + arg.SEED1 + " " + arg.SEED2);
    process.send(r);
}




function getFilter(filters) {
    return function (w) {
        return filterCallback(w, filters);
    };
}

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

function filterCallback(word, filters) {
    filters[0].forEach(function (end) {
        word = re(word, end);
    });
    filters[1].forEach(function (begin) {
        word = rb(word, begin);
    });
    return word;
}
