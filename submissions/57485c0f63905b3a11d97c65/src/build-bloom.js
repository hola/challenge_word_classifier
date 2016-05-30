var fs = require('fs');
var zlib = require('zlib');
var solution = require('./solution.full');

var data = fs.readFileSync('2grams.bin');
solution.init(data, 0);

var bloom = new Array(solution.BITS);
var dic = fs.readFileSync('uniq.txt').toString().split('\n');
var collisions = 0, ucollisions = 0, used = 0;
function add(word) {
  /*if (word.length < 3) {
    return false;
  }*/
  /*if (solution.simpleTest(word) !== undefined) {
    return false;
  }*/
  var hash = solution.arithm(word);
  if (hash == -1) {
    return false;
  }
  if (bloom[hash] !== undefined) {
    collisions++;
    if (bloom[hash].length == 1) {
      ucollisions++;
    }
    if (collisions < 50 && word.length < 8) {
      //console.log(dic[i] + ' = ' + bloom[hash].join(', '));
    }
    bloom[hash].push(word);
  } else {
    used++;
    bloom[hash] = [word];
  }
  return true;
}
for (var i = 0; i < dic.length; i++) {
  var word = dic[i];
  if (!add(word)) {
    continue;
  }
}

var evicted = 0;
var missing = 0;
if (process.argv[2] == 'evict') {
  var stats = require('./bloom-stats.json');

  var indices = stats.map(function(v, i) { return i; });
  indices.sort(function(i, j) {
    var v1 = (stats[i][1]||0) / (stats[i][0]||0);
    var v2 = (stats[j][1]||0) / (stats[j][0]||0);
    return (v2 - v1);
  });

  // Check if there's some hashes already missing from filter
  // (it should not happen)
  for (var i = 0; i < indices.length; i++) {
    if (bloom[indices[i]] === undefined && (stats[indices[i]][0] > stats[indices[i]][1])) {
      missing++;
    }
  }

  // Search for the best cutoff value
  var target =24200;//23200-24200 are best
  for (var i = 0; i < indices.length; i++) {
    if (bloom[indices[i]] !== undefined) {
      bloom[indices[i]] = undefined;
      evicted++;

      if (evicted >= target) {
        break;
      }
    }
  }
}

var bytes = new Array(((solution.BITS / 8) | 0) + 1);
for (var i = 0; i < bytes.length; i++) {
  var b = 0;
  for (var j = 0; j < 8; j++) {
    b <<= 1;
    b = b | (bloom[i * 8 + (7 - j)] === undefined ? 0 : 1);
  }
  bytes[i] = b;
}

var data = new Buffer(bytes);
fs.writeFileSync('bloom.bin', data);
var gzipped = zlib.gzipSync(data);
fs.writeFileSync('bloom.bin.gz', gzipped);

console.log(`Bloom filter size: ${bloom.length}, dictionary size: ${dic.length}, bits set originally: ${used}, collisions happened: ${collisions}, bits with more than 1 value: ${ucollisions}, bits evicted: ${evicted}, missing bits: ${missing}`);
console.log(`Final size: ${data.length} => ${gzipped.length}`);
