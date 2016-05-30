var fs = require('fs');
var zlib = require('zlib');

var dic = fs.readFileSync('words.txt').toString().split('\n');
var map = {};
for (var i = 0; i < dic.length; i++) {
  map[dic[i].toLowerCase()] = true;
}
var uniq = [];
for (var word in map) {
  uniq.push(word);
}
uniq.sort();
fs.writeFileSync('uniq.txt', uniq.join('\n'));

var bigrams = {};
for (var i = 0; i < uniq.length; i++) {
  var word = uniq[i];
  var apos = (word.substr(-2) == "'s");
  if (apos) {
    word = word.substr(0, word.length - 2);
  }
  if (word.indexOf("'") > -1) {
    continue;
  }
  /*if (word.length > 15) {
    continue;
  }*/

  for (var j = 0; j < word.length - 1; j++) {
    var gram = word.substr(j, 2);
    bigrams[gram] = bigrams[gram] || [0, 0, 0];
    if (apos && (j == word.length - 2)) continue;
    bigrams[gram][(j == 0) ? 0 : ((j == word.length - 2) ? 2 : 1)]++;
  }
}

var updated = [[], [], []];
if (process.argv[2] == 'update') {
  var stats = require('./2grams-stats.json');
  var types = ['prefixes', 'infixes', 'suffixes'];
  var max = [0.0, 0.0, 0.0];
  for (var i = 0; i < types.length; i++) {
    for (var k in stats[types[i]]) {
      var stat = stats[types[i]][k];
      if (stat[1] > 0) {
        max[i] = Math.max(max[i], stat[0] / stat[1]);
      }
    }
  }
  for (var i = 0; i < types.length; i++) {
    for (var k in stats[types[i]]) {
      var stat = stats[types[i]][k];
      if (k in bigrams && bigrams[k][i] != 0) {
        var v = 1 + (stat[1] > 0 ? ((220 * stat[0]) / (stat[1] * max[i])) | 0 : 220);
        if (v != bigrams[k][i] && i != 1) {
          updated[i].push([k, bigrams[k][i], v]);
          bigrams[k][i] = v;
        }
      }
    }
  }
}

var buf = [];
var a = 'a'.charCodeAt(0);
var norm = 162;
var count = 0;
for (var i = 0; i < 26; i++) {
  for (var j = 0; j < 26; j++) {
    var gram = String.fromCharCode(a + i, a + j);
    if (gram in bigrams) {
      var stat = bigrams[gram];
      for (var k = 0; k < 3; k++) {
        buf.push((stat[k] > 0) ? Math.max(1, Math.min(255, Math.floor(stat[k] / norm) | 0)) : 0);
      }
      count++;
    } else {
      buf.push(0, 0, 0);
    }
  }
}

var data = new Buffer(buf);
fs.writeFileSync('2grams.bin', data);
var gzipped = zlib.gzipSync(data);
fs.writeFileSync('2grams.bin.gz', gzipped);

console.log(`${count} non-empty bigrams saved (out of ${26*26}), ${updated[0].length} prefixes updated, ${updated[1].length} infixes updated, ${updated[2].length} suffixes updated`);
console.log(`Final size: ${data.length} => ${gzipped.length}`);
