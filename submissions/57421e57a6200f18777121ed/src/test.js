
const colors = require('./colors');

const zlib = require('zlib');

const fs = require('fs');

module.exports = () => {

  let buf = fs.readFileSync('./serialize');
  try {
    buf = zlib.gunzipSync(buf);
    console.log('Decompression');
  } catch(e) {
    console.log('No Decompression');
  }

  const stats = JSON.parse(fs.readFileSync('stats.json', 'utf8'));
  stats.topScore = stats.topScore || 0

  const wordsTrue = fs.readFileSync('./words-true.txt', 'utf8').split('\n');
  const wordsFalse = fs.readFileSync('./words-false.txt', 'utf8').split('\n');

  const solution = require('./solution.min');

  solution.init(buf);

  let correct = 0;

  let correctP = 0;

  let correctN = 0;

  wordsTrue.forEach(word => {
    if (solution.test(word)) {
      correct++;
      correctP++;
    } else  if (process.argv.indexOf('-p') !== -1 || process.argv.indexOf('--verbose') !== -1) {
      console.log(colors.green + word + colors.reset);
    }
  });

  wordsFalse.forEach(word => {
    if (solution.test(word) == false) {
      correct++;
      correctN++;
    } else  if (process.argv.indexOf('-n') !== -1 || process.argv.indexOf('--verbose') !== -1) {
      console.log(colors.red + word + colors.reset);
    }
  });


  const totalPositives = wordsTrue.length;
  const totalNegatives = wordsFalse.length;
  const totalKeys = totalPositives + totalNegatives;

  console.log(`totalPositives: ${totalPositives}; totalNegatives: ${totalNegatives}`)

  const score = (100 * correct / totalKeys);
  const scoreP = (100 * correctP / totalPositives);
  const scoreN = (100 * correctN / totalNegatives);

  const printChange = (result, top) => {
    if (result - top > 0) {
      return colors.green + '+' + Math.abs(result - top).toFixed(4) + colors.reset;
    } else if (result - top < 0) {
      return colors.red + '–' + Math.abs(result - top).toFixed(4) + colors.reset;
    } else {
      return '';
    }
  };

  console.log('Score:    ' + score.toFixed(4)  + '%', printChange(score, stats.score));
  console.log('Negative: ' + scoreN.toFixed(4) + '%', printChange(scoreN, stats.scoreN));
  console.log('Positive: ' + scoreP.toFixed(4) + '%', printChange(scoreP, stats.scoreP));

  if (score > stats.topScore) {
    console.log(colors.bg_green + colors.hicolor + 'new record! +' + (score - stats.topScore) + colors.reset)
  } else if (score === stats.topScore) {
    console.log(`${colors.hicolor}Is best result ${colors.reset}`)
  } else {
    console.log(`${colors.hicolor}From best: –${(stats.topScore - score).toFixed(4)} ${colors.reset}`)
  }

  const topScore = score > stats.topScore ? score : stats.topScore;

  fs.writeFileSync('./stats.json', JSON.stringify({ score, scoreP, scoreN, topScore }), 'utf8');

};

if (process.argv.indexOf('--do-test') !== -1) {
  module.exports()
}

