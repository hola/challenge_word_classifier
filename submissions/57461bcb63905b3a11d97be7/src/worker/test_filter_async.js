var fs = require('fs');
var cluster = require('cluster');
const readline = require('readline');
var bloomTester = require('./testBloom');

var SIZEBLOOM = 63 * 1024 * 8 - 1;
// var SEED1 = 40;
// var SEED2 = 1;
var SEED1 = 2;
var SEED2 = 90;

var FREE_CPU = 1;

var COL_E = 0.003;
var COL_B = 0.003;
var COL_M = 0.0005;

var DIFF = 0.0001;

var USE_ALL_TEST = true;

var TEST_FILE = 'all_test_1M.txt';
var TEST_FILE_BIG = 'all_test_20M.txt';

var init_filter = [
    [],
    [],
    [],
];

init_filter = [[],[],[]];

function testReg(word) {
    if (word.split(/[aeiou]/).filter((w) => {
        return w.length > 4;
    }).length > 0) {
        return false;
    }
    return word.length > 0;
    //return true;
}

var words = fs.readFileSync('words.txt', 'utf8').toLowerCase().split('\n');
var chars = "abcdefghijklmnopqrstuvwxyz'";

var clusterHandler;
function messageClusterHandler(worker, message, handle) {
    return clusterHandler(worker, message, handle);
}

function runTest(words, filters, size, seed1, seed2, file, callback) {
    var words_local = getUnique(words.map(getFilter(filters))).filter(testReg);
    bloomTester.init(words_local, size, seed1, seed2);
    var count = 0;
    var acc = 0;
    var acc_0 = 0;
    var acc_1 = 0;

    const rl = readline.createInterface({
        input: fs.createReadStream(file, 'utf8')
    });
    rl.on('line', (line) => {
        var arr = line.split('\t');
        if (USE_ALL_TEST || arr[1] == '0') {
            var w = filterCallback(arr[0], filters);
            var t = testReg(w) && bloomTester.test(w);
            if (t == (arr[1] == '1')) {
                acc++;
            }
            count++;
        }
    });
    rl.on('close', () => {
        callback({
            tests: count,
            accepted: acc
        })
    });

}
function getFilters(words, filters, bestBloom, bestDiff) {
    var words_local = getUnique(words.map(getFilter(filters)));
    var filterE = [];
    var filterB = [];
    var filterM = [];

    var mode = 1;
    if (bestDiff[0] <= bestDiff[1]) {
        mode = 2;
    }
    if (bestDiff[0] <= DIFF && bestDiff[1] <= DIFF) {
        mode = 0;
    }
    if (mode == 1) filterE = getEnds(words_local);
    if (mode == 2) filterB = getBegins(words_local);
    //if (mode == 3) filterM = get2Chars();// getMid(words, getFilter(filters));

    console.log("FiltersE: " + JSON.stringify(filterE));
    console.log("FiltersB: " + JSON.stringify(filterB));
    console.log("FiltersM: " + JSON.stringify(filterM));

    var filtersArr = [];
    for (var i = 0; i < filterE.length; i++) {
        filtersArr.push({
            w: filterE[i],
            m: 0
        });
    }
    for (var i = 0; i < filterB.length; i++) {
        filtersArr.push({
            w: filterB[i],
            m: 1
        });
    }
    for (var i = 0; i < filterM.length; i++) {
        filtersArr.push({
            w: filterM[i],
            m: 2
        });
    }
    filtersArr.forEach((a) => {
        a.filters = filters;
        a.bestBloom = bestBloom;
    });
    var filtersUniq = filtersArr;//getUnique(filtersArr.map(JSON.stringify));
    console.log('Tasks: ' + filtersUniq.length);

    return filtersUniq;
}

function getPriority(r) {
    return ((r.accepted / r.tests) - r.arg.bestBloom) * r.arg.w.length;
}

function printFloat(f) {
    if (f >= 0)
        return "+" + f.toFixed(5);
    return f.toFixed(5);
}

function runStep(words, filters, size, seed1, seed2, bestBloom, bestBloomBig, bestDiff) {
    console.log("words", filters, size, seed1, seed2, bestBloom, bestBloomBig, bestDiff);
    console.log("DIFF. suff - " + printFloat(bestDiff[0]) + " pref - " + printFloat(bestDiff[1]));
    var filtersUniq = getFilters(words, filters, bestBloom, bestDiff);
    var filtersUniqLen = filtersUniq.length;
    var filters_i = 0;
    var results = [];
    var file = TEST_FILE;

    clusterHandler = function (worker, message, handle) {

        results.push(message);

        if (results.length == filtersUniqLen && file == TEST_FILE) {

            filtersUniq = results.filter(function (a) {
                return ((a.accepted / a.tests) - bestBloomBig) > DIFF;
            }).sort(function (a, b) {
                return -(getPriority(a) - getPriority(b));
            }).map(function (a) {
                a.arg.old = a.accepted / a.tests - bestBloom;
                a.arg.filters = filters;
                a.arg.bestBloom = bestBloomBig;
                return a.arg;
            });
            if (filtersUniq.length > 14)
                filtersUniq.length = 14;
            console.log("Start BIG TEST. Best: " + JSON.stringify(filtersUniq.map((a) => a.w)));
            filtersUniqLen = filtersUniq.length;
            results = [];
            filters_i = 0;
            file = TEST_FILE_BIG;
            for (var id in cluster.workers) {
                if (filtersUniq[filters_i]) {
                    var arg = filtersUniq[filters_i++];
                    arg.file = file;
                    cluster.workers[id].send(arg);
                }
            }

            return;
        }

        if (results.length == filtersUniqLen) {
            var tBloom = 0;
            var tBest;
            var bestP = 0;
            for (var i = 0; i < results.length; i++) {
                var t = results[i];
                var p = getPriority(t);
                if (p > bestP && t.arg.file == TEST_FILE_BIG) {
                    bestP = p;
                    tBloom = t.accepted / t.tests;
                    tBest = t;
                    console.log("BEST Test: " + JSON.stringify(tBest.filters) + " - " + tBloom + " - " + p);
                }
            }


            if (tBloom > (bestBloomBig + DIFF)) {
                console.log("****** BEST Test: " + JSON.stringify(tBest.filters) + " - " + printFloat((tBest.accepted / tBest.tests)) + " - " + printFloat((tBest.accepted / tBest.tests) - bestBloomBig));
                fs.appendFileSync('BestTest.json', JSON.stringify(tBest.filters) + " - " + (tBest.accepted / tBest.tests) + "\n", 'utf8');

                bestDiff[message.arg.m] = tBloom - bestBloomBig;
                bestBloomBig = tBloom;
                bestBloom = tBest.arg.old + bestBloom;

                runStep(words, tBest.filters, size, seed1, seed2, bestBloom, bestBloomBig, bestDiff);
            } else {
                bestDiff[message.arg.m] = tBloom - bestBloomBig;
                runStep(words, filters, size, seed1, seed2, bestBloom, bestBloomBig, bestDiff);
            }
        } else {
            if (filtersUniq[filters_i]) {
                var arg = filtersUniq[filters_i++];
                arg.file = file;
                worker.send(arg);
            }
        }
    };
    if (filtersUniq.length == 0) {
        process.exit();
    }
    for (var id in cluster.workers) {
        if (filtersUniq[filters_i]) {
            var arg = filtersUniq[filters_i++];
            arg.file = file;
            cluster.workers[id].send(arg);
        }
    }
}

if (cluster.isMaster) {
    const numCPUs = require('os').cpus().length - FREE_CPU;
    for (var i = 0; i < numCPUs; i++) {
        var cl = cluster.fork();
    }

    runTest(words, init_filter, SIZEBLOOM, SEED1, SEED2, TEST_FILE, (r1) => {
        console.log(TEST_FILE + ' - ' + printFloat((r1.accepted / r1.tests)) + " - " + JSON.stringify(init_filter));
        var k1 = r1.accepted / r1.tests;
        runTest(words, init_filter, SIZEBLOOM, SEED1, SEED2, TEST_FILE_BIG, (r2) => {
            console.log(TEST_FILE_BIG + ' - ' + printFloat((r2.accepted / r2.tests)) + " - " + JSON.stringify(init_filter));
            var k2 = r2.accepted / r2.tests;
            runStep(words, init_filter, SIZEBLOOM, SEED1, SEED2, k1, k2, [1, 1]);
        });
    });
    cluster.on('message', messageClusterHandler);
}

if (cluster.isWorker) {
    process.on('message', messageHandler);
}

function messageHandler(task) {

    var arg = task;//JSON.parse(task);
    var filters = arg.filters;
    filters[arg.m].push(arg.w);
    var callback = (r) => {
        r.filters = filters;
        r.arg = arg;
        //r.task = task;
        //var rez = JSON.stringify(r);
        var k = r.accepted / r.tests;
        console.log(arg.file + ": " + printFloat(k - arg.bestBloom) + " - " + printFloat(k) + " - " + printFloat(getPriority(r)) + (arg.old ? " OLD: " + printFloat(arg.old) + " - " + printFloat(k - arg.bestBloom - arg.old) : "") + " : " + JSON.stringify(filters));
        process.send(r);
    };
    var r = runTest(words, filters, SIZEBLOOM, SEED1, SEED2, arg.file, callback);
}






function getUnique(arr) {
    var u = {}, a = [];
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
    filters[2].forEach(function (end) {
        if (end.length == 1) word = word.split(end[0]).join('');
        else word = word.split(end[0]).join(end[1]);
    });


    return word;
}

function calcTreeE(words, f) {
    var tree = {};

    for (var i = 0; i < words.length; i++) {
        var t = tree;
        var s = words[i];
        if (f) s = f(s);
        for (var j = s.length - 1; j >= 0; j--) {
            if (!t[s[j]]) t[s[j]] = {
                c: 0,
                d: {},
                e: s.substr(j)
            };
            t[s[j]].c += 1;
            t = t[s[j]].d;
        }
    }
    return {
        d: tree,
        e: "",
        c: words.length
    };
}

function getEnds(words, callback) {
    var tree = calcTreeE(words, callback);

    var ends = [tree];
    var l2 = 0;
    for (var k = 0; k < 10; k++) {
        var l = ends.length;
        for (var i = l2; i < l; i++) {
            var t = ends[i].d;
            for (var i1 = 0; i1 < chars.length; i1++) {
                var t1 = t[chars[i1]];
                if (t1) {
                    ends.push(t1);
                }
            }
        }
        l2 = l;
    }
    for (var i = 0; i < ends.length; i++) {
        delete ends[i].d;
    }
    var t = ends.shift();

    return ends.filter(function (a) {
        return a.c > COL_E * t.c;
    }).sort(function (a, b) {
        return b.c - a.c;
    }).map(function (a) {
        return a.e;
    });
}

function calcTreeB(words, f) {
    var tree = {};

    for (var i = 0; i < words.length; i++) {
        var t = tree;
        var s = words[i];
        if (f) s = f(s);
        for (var j = 0; j < s.length; j++) {
            if (!t[s[j]]) t[s[j]] = {
                c: 0,
                d: {},
                e: s.substring(0, j + 1)
            };
            t[s[j]].c += 1;
            t = t[s[j]].d;
        }
    }
    return {
        d: tree,
        e: "",
        c: words.length
    };
}

function getBegins(words, callback) {
    var tree = calcTreeB(words, callback);

    var ends = [tree];
    var l2 = 0;
    for (var k = 0; k < 10; k++) {
        var l = ends.length;
        for (var i = l2; i < l; i++) {
            var t = ends[i].d;
            for (var i1 = 0; i1 < chars.length; i1++) {
                var t1 = t[chars[i1]];
                if (t1) {
                    ends.push(t1);
                }
            }
        }
        l2 = l;
    }
    for (var i = 0; i < ends.length; i++) {
        delete ends[i].d;
    }
    var t = ends.shift();

    return ends.filter(function (a) {
        return a.c > COL_B * t.c;
    }).sort(function (a, b) {
        return b.c - a.c;
    }).map(function (a) {
        return a.e;
    });
}

function calcTreeM(words, f) {
    var tree = {};

    for (var i = 0; i < words.length; i++) {

        var s = words[i];
        if (f) s = f(s);
        for (var k = 1; k < s.length - 1; k++) {
            var t = tree;
            for (var j = k; j < s.length - 1; j++) {
                if (!t[s[j]]) t[s[j]] = {
                    c: 0,
                    d: {},
                    e: s.substring(k, j + 1)
                };
                t[s[j]].c += 1;
                t = t[s[j]].d;
            }
        }
    }
    return {
        d: tree,
        e: "",
        c: words.length
    };
}

function getMid(words, callback) {
    var tree = calcTreeM(words, callback);

    var ends = [tree];
    var l2 = 0;
    for (var k = 0; k < 5; k++) {
        var l = ends.length;
        for (var i = l2; i < l; i++) {
            var t = ends[i].d;
            for (var i1 = 0; i1 < chars.length; i1++) {
                var t1 = t[chars[i1]];
                if (t1) {
                    ends.push(t1);
                }
            }
        }
        l2 = l;
    }
    for (var i = 0; i < ends.length; i++) {
        delete ends[i].d;
    }
    var t = ends.shift();

    return ends.filter(function (a) {
        return a.c > COL_M * t.c;
    }).sort(function (a, b) {
        return b.c - a.c;
    }).map(function (a) {
        return a.e;
    });
}

function get2Chars() {
    var res = [];
    for (var i1 = 0; i1 < chars.length; i1++) {
        res.push(chars[i1]);
        for (var i2 = 0; i2 < chars.length; i2++) {
            res.push(chars[i1] + chars[i2]);
        }
    }
    return res;
}
