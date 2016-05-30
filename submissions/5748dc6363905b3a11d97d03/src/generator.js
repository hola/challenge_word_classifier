var fs = require('fs')
function preventInlining() {}
var heuristics = fs.readFileSync('./heuristics.js', 'utf-8');
eval(heuristics)
var stemmer_mod = fs.readFileSync('./stemmer_mod.js', 'utf-8');
eval(stemmer_mod)
var chf = {}
"abcdefghijklmnopqrstuvwxyz".split('').forEach(c => chf[c.charCodeAt(0)] = 1)
var threshold = 0;

var w = fs.readFileSync('./words.txt', 'utf-8').toLowerCase().split('\n').slice(0, -1);
var words = {};
w.forEach(function (e) {
    var c = 3750000 / 661686;
    var s = stem.of(e);
    if (he(s) && s != 'constructor') {
        if (words[s] == null) {
            words[s] = c;
        } else {
            words[s] += c;
        }
    }
})
var nw = JSON.parse(fs.readFileSync('./nonwords.json'));
var nonwords = {};
Object.keys(nw).forEach(function (e) {
    var s = stem.of(e);
    if (he(s)) {
        if (nonwords[s] == null) {
            nonwords[s] = nw[e];
        } else {
            nonwords[s] += nw[e];
        }
    }
})
fs.writeFileSync('./new_wnwg.json', JSON.stringify({w:words, n:nonwords}))


var ht = require('./heuristics_training.js')(words, nonwords)
chf = ht.chf;
threshold = ht.threshold;
Object.keys(words).forEach(w => {if (!he(w)) delete words[w]})
Object.keys(nonwords).forEach(n => {if (!he(n)) delete nonwords[n]})
var cfa = new Uint16Array(26)
Object.keys(chf).sort((a,b)=>parseInt(a)-parseInt(b)).forEach(function (e, i) {
    cfa[i] = chf[e]
})
var d = 532489
var hash_function = fs.readFileSync('./hash_function.js', 'utf-8')
eval(hash_function)
var bloom_array = require('./bloom.js')(words, nonwords, h, d)

var data = []
data.push(bloom_array)
var BLOOM_END = bloom_array.length

data.push(Buffer.from(cfa.buffer))
var CHF_END = BLOOM_END + cfa.byteLength

var thresholdBuf = Buffer.alloc(8)
thresholdBuf.writeDoubleLE(threshold)
data.push(thresholdBuf)

var init = `var chf = {};
for (var i = 0; i < 26; i++) chf[i + 97] = d.readInt16LE(${BLOOM_END} + i * 2);
var threshold = d.readDoubleLE(${CHF_END});
var div = ${d};`

var test = fs.readFileSync('./test.js', 'utf-8')
var js = init + heuristics + stemmer_mod + hash_function + test
fs.writeFileSync('./js_for_data.gz.js', js)

/*
 * Closure compiler
 */

var querystring = require('querystring');
var http = require('http');

var post_data = querystring.stringify({
    'compilation_level': 'ADVANCED_OPTIMIZATIONS',
    'output_format': 'text',
    'output_info': 'compiled_code',
    'warning_level': 'QUIET',
    'js_code': js,
    'js_externs': 'function readInt16LE(number){} function readDoubleLE(number){} function preventInlining(){}'
});

var post_options = {
    host: 'closure-compiler.appspot.com',
    port: '80',
    path: '/compile',
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(post_data)
    }
};

var post_req = http.request(post_options, function (res) {
    res.setEncoding('utf8');
    var body = ''
    res.on('data', function (d) {
        body += d;
    });
    res.on('end', function () {
        save(data, body.replace(/preventInlining\(\);/g, ''), CHF_END + 8)
    })
});

post_req.write(post_data);
post_req.end();


/*
 * Create data.gz
 */

var zlib = require('zlib')

function save(data, js_min, jsStart) {
    fs.writeFileSync('./js_for_data.gz.min.js', js_min)
    data.push(Buffer.from(js_min, 'utf-8'))
    var buffer = Buffer.concat(data)
    fs.writeFileSync('./data.gz', zlib.gzipSync(buffer))
    var solution = `exports.init=d=>eval(d.toString('',${jsStart}))`
    fs.writeFileSync('./solution.js', solution)
}