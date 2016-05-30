'use strict';

const fs       = require('fs');
const readline = require('readline');
const zlib     = require('zlib');

let wordsByLine = readline.createInterface({ input: fs.createReadStream('./__/words.txt') });

/**
 * 200k
 * 
 * ~67.2%
 * 55.3kb gzipped
 * -------------------
 * ~72.6% (the whole stats file)
 * 149.3kb gzipped
 */

/**
 * [
 *   <Alphabet Letter 1>[
 *     <Alphabet Letter 2>[
 *       <wordLength - 2>[
 *         <{Chance}s AL1 to see AL2 after>[<Index = AL1 position in a word>]
 *       ], 
 *       <...>
 *     ], 
 *     <... 26 more>
 *   ], 
 *   <... 26 more>
 * ]
 */

const ALP = [
  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 
  'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '\''
];

function beautifyRegExps (symbolsString) {
  let sortedSymbols = symbolsString.split('').sort().join('');
  let letters = ALP.sort();

  let startIndex = 0;
  let output = '';

  if (sortedSymbols[0] === '\'') {
    output = '\'';
    startIndex = 1;
  }

  let compareIndex = 1;
  let prevSymbol = null;
  let prevSymbolsLength = 0;
  let wasOpened = false;

  for (let i = startIndex, len = sortedSymbols.length; i < len; i++) {
    if (sortedSymbols[i] === letters[compareIndex]) {
      if (wasOpened) {
        prevSymbol = sortedSymbols[i];
        prevSymbolsLength++;
        compareIndex++;
        continue;
      }

      output += sortedSymbols[i];
      wasOpened = true;
    } else {
      if (wasOpened) {
        if (prevSymbolsLength > 0) {
          if (prevSymbolsLength === 1) 
            output += prevSymbol;
          else 
            output += '-' + prevSymbol;

          prevSymbol = '';
          prevSymbolsLength = 0;
        }

        wasOpened = false;
      }

      compareIndex = letters.indexOf(sortedSymbols[i]);
      i = i - 1;
      continue;
    }

    compareIndex++;
  }

  if (wasOpened && prevSymbolsLength > 0) {
    if (prevSymbolsLength === 1) 
      output += prevSymbol;
    else 
      output += '-' + prevSymbol;
  }

  return output;
}


let results = [];

wordsByLine.on('line', line => {
  line = line.toLowerCase();

  if (line.length === 1) 
    return;

  let lineLength = line.length;

  for (let i = 0; i < lineLength; i++) {
    let currentAL1 = line[i];
    let currentAL1Index = ALP.indexOf(currentAL1);
    let nextLetter = line[i + 1];

    if (!results[currentAL1Index]) 
      results[currentAL1Index] = [];

    for (let j = 0, len = ALP.length; j < len; j++) {
      let currentAL2 = ALP[j];
      let currentAL2Index = j;

      if (!results[currentAL1Index][currentAL2Index]) 
        results[currentAL1Index][currentAL2Index] = [];

      if (!results[currentAL1Index][currentAL2Index][lineLength - 2]) 
        results[currentAL1Index][currentAL2Index][lineLength - 2] = [];

      if (nextLetter === currentAL2) {
        if (!results[currentAL1Index][currentAL2Index][lineLength - 2][i]) 
          results[currentAL1Index][currentAL2Index][lineLength - 2][i] = line[i - 1] || '';

        if (!~results[currentAL1Index][currentAL2Index][lineLength - 2][i].indexOf(line[i - 1] || '')) 
          results[currentAL1Index][currentAL2Index][lineLength - 2][i] += line[i - 1] || '';
      }
    }
  }
});

wordsByLine.on('close', () => {
  for (let i = 0; i < results.length; i++) {
    for (let j = 0; j < results[i].length; j++) {
      for (let k = 0; k < results[i][j].length; k++) {
        if (!results[i][j][k] || results[i][j][k].length === 0) {
          results[i][j][k] = 0;
          continue;
        }

        for (let l = 0; l < results[i][j][k].length; l++) {
          if (results[i][j][k][l] != null) {
            // cut the results
            if (l > 2) {
              results[i][j][k][l] = 0;
              continue;
            }

            results[i][j][k][l] = beautifyRegExps(results[i][j][k][l]);
          } else {
            results[i][j][k][l] = 0;
          }

          if (results[i][j][k][l].length === 0) 
            results[i][j][k][l] = 0;
        }
      }
    }
  }

  let data = new Buffer(JSON.stringify(results));
      data = zlib.gzipSync(data);

  fs.writeFileSync(`./words_stat_${Date.now()}.json.gz`, data);
});