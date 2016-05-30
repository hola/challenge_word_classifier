var solution = require('./solution.full');
var solutionmin = require('./solution');
var fs = require('fs');
var zlib = require('zlib');

if (process.argv.length < 3) {
  console.log('Please provide either a range to test with or a word `check` to do a quick check on the first 10 thousand tests.');
  process.exit(0);
}

var data = fs.readFileSync('data.gz');
data = zlib.gunzipSync(data);

var bigrams = fs.readFileSync('2grams.bin.gz');
bigrams = zlib.gunzipSync(bigrams);

var bloom = fs.readFileSync('bloom.bin.gz');
bloom = zlib.gunzipSync(bloom);

solution.init(bigrams, bloom);
solutionmin.init(data);

var check = (process.argv[2] == 'check');
var st, en;
if (check) { // Quick check on the first 10000 testcases, without updating stats
  st = 526653; // 0;
  en = 526754; // 9;
} else {
  st = parseInt(process.argv[2]);
  en = parseInt(process.argv[3]);
}
var debug = !!process.argv[4];

var dic = fs.readFileSync('uniq.txt').toString().split('\n');

var total = 0;
var correct = 0;
var false_pos = 0;
var false_neg = 0;
var fails = new Array(solution.BITS);
var posit = new Array(solution.BITS);
var prefixes = {};
var infixes = {};
var suffixes = {};
for (var i = st; i <= en; i++) {
  var pos = require('./tests/' + (i * 1000 + 1) + '-pos.json');
  var neg = require('./tests/' + (i * 1000 + 1) + '-neg.json');

  if (debug) {
    console.log('VALID WORDS:');
  }
  for (var j = 0; j < pos.length; j++) {
    var hash = solution.arithm(pos[j]);
    if (hash != -1/* && solution.simpleTest(pos[j]) === undefined*/) {
      posit[hash] = (posit[hash] || 0) + 1;
    }
    /*for (var k = 0; k < pos[j].length - 1; k++) {
      var sub = pos[j].substr(k, 2);
      var stats = (k == 0 ? prefixes : (k == pos[j].length - 2 ? suffixes : infixes));
      stats[sub] = stats[sub] || [0, 0];
      stats[sub][0]++;
    }*/

    if (solutionmin.test(pos[j], debug? true : undefined)) {
      correct++;
    } else {

      if (debug) {
        console.log('-+ ' + pos[j]);
      }
      false_neg++;
    }
    total++;
    if (debug && j == 100) break;
  }
  if (debug) {
    console.log('WRONG WORDS:');
  }
  for (var j = 0; j < neg.length; j++) {
    var hash = solution.arithm(neg[j]);
    if (hash != -1/* && solution.simpleTest(pos[j]) === undefined*/) {
      fails[hash] = (fails[hash] || 0) + 1;
    }
    /*for (var k = 0; k < neg[j].length - 1; k++) {
      var sub = neg[j].substr(k, 2);
      var stats = (k == 0 ? prefixes : (k == neg[j].length - 2 ? suffixes : infixes));
      stats[sub] = stats[sub] || [0, 0];
      stats[sub][1]++;
    }*/

    if (!solutionmin.test(neg[j], debug? false : undefined)) {
      correct++;
    } else {

      if (debug) {
        console.log('+- ' + neg[j]);
      }
      false_pos++;
    }
    total++;
    if (debug && j == 100) break;
  }

  console.log(total + ' tests runned, score: ' + (100.0 * correct / total).toFixed(6) + '% (' + correct + ')');
  console.log('  ' + (100.0 * false_pos / total).toFixed(6) + '% false positives (' + false_pos + ')');
  console.log('  ' + (100.0 * false_neg / total).toFixed(6) + '% false negatives (' + false_neg + ')');
}

if (!check) {
  fs.writeFileSync('2grams-stats.json', JSON.stringify({ prefixes: prefixes, infixes: infixes, suffixes: suffixes}));

  var stats = [];
  for (var i = 0; i < solution.BITS; i++) {
    stats.push([posit[i] || 0, fails[i] || 0]);
  }
  fs.writeFileSync('bloom-stats.json', JSON.stringify(stats));
}
