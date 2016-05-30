var fs = require('fs');
var zlib = require('zlib');
var filesize = require('filesize');
var ClosureCompiler = require('closurecompiler');
var BloomFilter = require('bloom-filter');
var es6Minify = require('./es6-minify');
var processors = require('./processors');
var words = fs.readFileSync('./words.txt', 'utf8').split('\n');
var collectStatistic = !!process.argv[2];

var falsePositiveRate = 0.37961;
var alphabet = 'abcdefghijklmnopqrstuvwxyz\'';
var wordsSet = new Set();
var processedSet = new Set();

words
  .filter(word => word.length > 1)
  .forEach(word => wordsSet.add(word.toLowerCase()));

var doesExist = (word) => wordsSet.has(word);
var addToSet = (word) => {
  if (
    // Exclude <= 3 words, we will return false in such case
    word.length > 3 &&
    word.match(/'s$/) == null
  ) {
    processedSet.add(word);
  }
};

if (collectStatistic) {
  var stats = {
    consecutive: {},
    startCharCount: {},
    endCharCount: {},
    charCount: {},
    length: {}
  };

  for (var i = 0; i < alphabet.length; i++) {
    stats.consecutive[alphabet[i]] = 0;
    stats.startCharCount[alphabet[i]] = 0;
    stats.endCharCount[alphabet[i]] = 0;
    stats.charCount[alphabet[i]] = 0;
  }
}

wordsSet.forEach(word => {
  if (collectStatistic) {
    var match;
    if (match = word.match(/([aeijouybcdfghklmnpqrstvwxz])\1\1/)) {
      stats.consecutive[match[1]] += 1;
    }
  }
  processors(word, doesExist, addToSet);
});

if (collectStatistic) {
  processedSet.forEach(word => {
    stats.length[word.length] |= 0;
    stats.length[word.length] += 1;
    stats.startCharCount[word[0]] += 1;
    stats.endCharCount[word[word.length - 1]] += 1;
    for (var j = 0; j < word.length; j++) {
      stats.charCount[word[j]] += 1;
    }
  });
}

var compressScript = (filename, resolve, reject) => {
  ClosureCompiler.compile([filename], {}, (error, result) => {
    error && reject();
    result ? resolve(result) : reject();
  });
};

var serializeScript = (scriptStr) => {
  return scriptStr.trim()
    .replace(/\n/g, '')
    .replace(/function\(([a-zA-Z])\)/g, '$1=>')
    .replace(/function\(([a-zA-Z,]{1,})\)/g, '($1)=>')
    .slice(scriptStr.indexOf('=') + 1);
};

var getHashes = () => {
  var filter = BloomFilter.create(processedSet.size, falsePositiveRate);
  processedSet.forEach(word => filter.insert(new Buffer(word, 'utf8')));
  return filter.toObject().vData;
};

var toBinary = (hashes) => {
  var int8 = new Uint8Array(hashes.length);
  hashes.forEach((hash, index) => int8[index] = hash);
  return new Buffer(int8, 'binary');
};

Promise.all([
  new Promise((resolve, reject) => compressScript('processors.js', resolve, reject)),
  new Promise((resolve, reject) => compressScript('bloom.js', resolve, reject))
]).then((values) => {
  var minifiedSolution = es6Minify('./solution.js');
  var minifiedProcessors = 'p=' + serializeScript(values[0]);
  var minifiedBloomFilter = 'b=' + serializeScript(values[1]);
  var scripts = minifiedProcessors + minifiedBloomFilter + minifiedSolution;
  var dataGzip = zlib.gzipSync(toBinary(getHashes()), { level: 9 });

  fs.writeFile('./dist/data.gz', dataGzip);
  fs.writeFile('./dist/words.txt', Array.from(processedSet).join('\n'));
  fs.writeFile('./dist/solution.js', scripts);

  if (collectStatistic) {
    console.log('Words length:');

    Object
      .keys(stats.length)
      .forEach(length => {
      console.log(` ${length}: ${stats.length[length]}`);
    });

    console.log('');
    console.log('Start in:');

    Object
      .keys(stats.startCharCount)
      .sort((a, b) => stats.startCharCount[b] - stats.startCharCount[a])
      .forEach(char => {
      console.log(` ${char}: ${stats.startCharCount[char]}`);
    });

    console.log('');
    console.log('End with:');

    Object
      .keys(stats.endCharCount)
      .sort((a, b) => stats.endCharCount[b] - stats.endCharCount[a])
      .forEach(char => {
      console.log(` ${char}: ${stats.endCharCount[char]}`);
    });

    console.log('');
    console.log('Has char:');

    Object
      .keys(stats.charCount)
      .sort((a, b) => stats.charCount[b] - stats.charCount[a])
      .forEach(char => {
      console.log(` ${char}: ${stats.charCount[char]}`);
    });

    console.log('');
    console.log('Consecutive (>= 3):');

    Object
      .keys(stats.charCount)
      .filter(char => stats.consecutive[char] > 0)
      .sort((a, b) => stats.consecutive[b] - stats.consecutive[a])
      .forEach(char => {
      console.log(` ${char}: ${stats.consecutive[char]}`);
    });

    console.log('');
  }

  var filesLength = scripts.length + dataGzip.length;

  console.log(`Total size:    ${filesize(filesLength, {standard: "iec"})} (${filesLength}/${Math.pow(2, 16)})`);
  console.log(`Words:         ${processedSet.size}/${wordsSet.size}`);
  console.log(`Rejected:      ${(100 - processedSet.size / wordsSet.size * 100).toFixed(2)}%`);
});
