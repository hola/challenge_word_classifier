var fs = require('fs');
var zlib = require('zlib');
var data = zlib.gunzipSync(fs.readFileSync('./dist/data.gz'));
var mod = require('./dist/solution');
var testcasesPath = './testcases/';
var collectStatistic = !!process.argv[2];

if (mod.init) {
  mod.init(data);
}

fs.readdir(testcasesPath, (err, files) => {
  var results = [];
  var valid = {};
  var invalid = {};
  var set_ = new Set();

  if (collectStatistic) {
    var stats = {
      all: [],
      guessed: [],
      notTrue: [],
      notFalse: []
    };
  }

  files.forEach((file) => {
    var testcase = JSON.parse(fs.readFileSync(testcasesPath + file));
    var guesses = Object.keys(testcase).map((word) => {
      var guessedValue = mod.test(word);
      var actualValue = testcase[word];
      if (!set_.has(word)) {
        if (actualValue === true) {
          valid[word.length] |= 0;
          valid[word.length] += 1;
        } else {
          invalid[word.length] |= 0;
          invalid[word.length] += 1;
        }
      }

      if (collectStatistic) {
        stats.all.push(word);
        if (actualValue !== guessedValue) {
          guessedValue ?
            stats.notTrue.push(word) :
            stats.notFalse.push(word);
        } else {
            stats.guessed.push(word);
        }
      }

      set_.add(word);
      return actualValue === guessedValue;
    });
    var guessed = guesses.filter(guess => guess === true);
    results.push(guessed.length / guesses.length * 100);
  });

  console.log('Average        Max           Min');
  console.log(
    (results.reduce((a, b) => a + b) / results.length).toFixed(7) + '%   ',
    Math.max.apply(Math, results).toFixed(2) + '%       ',
    Math.min.apply(Math, results).toFixed(2) + '%'
  );

  if (collectStatistic) {
    var printChars = (str, chars) => {
      return (new Array(chars + 1).join(' ') + (str || '-')).slice(-chars);
    };

    var getLengths = stat => {
      var lengths = {};
      stat.forEach(word => {
        lengths[word.length] |= 0;
        lengths[word.length] += 1;
      });
      return lengths;
    };

    var lengths = new Array(50).fill().map((val, index) => {
      index += 1;

      var all = getLengths(stats.all);
      var guessed = getLengths(stats.guessed);
      var notFalse = getLengths(stats.notFalse);
      var notTrue = getLengths(stats.notTrue);

      return ` ${printChars(index, 2)}:  ${printChars(all[index], 13)}  ${printChars(guessed[index], 13)}  ${printChars(notFalse[index], 13)}  ${printChars(notTrue[index], 13)}  ${printChars((guessed[index] * 100 / all[index]).toFixed(2) + '%', 13)}`;
    });

    var sort = stat => stat.sort((a, b) => {
      var lengthDiff = a.length - b.length;
      if (lengthDiff === 0) {
        return a[0] - b[0];
      }
      return lengthDiff;
    });

    console.log('');
    console.log(`      ${printChars('All', 13)}  ${printChars('Guessed', 13)}  ${printChars('Not false', 13)}  ${printChars('Not true', 13)}  ${printChars('Ratio', 13)}`);
    console.log(`      ${printChars(stats.all.length, 13)}  ${printChars(stats.guessed.length, 13)}  ${printChars(stats.notFalse.length, 13)}  ${printChars(stats.notTrue.length, 13)}  ${printChars((stats.guessed.length * 100 / stats.all.length).toFixed(2) + '%', 13)}`);
    console.log(lengths.join('\n'));


    fs.writeFile('./tmp/not-false.txt', sort(stats.notFalse).join('\n'));
    fs.writeFile('./tmp/not-true.txt', sort(stats.notTrue).join('\n'));
  }
});
