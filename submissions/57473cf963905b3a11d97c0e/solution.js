'use strict';

const MAX_WORD_LENGTH = 60;
let stats;

const ALP = [
  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 
  'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '\''
];

function testWord (word) {
  if (
    !word || 
    word.startsWith('\'') || 
    /[^a-z']/i.test(word) || 
    word.length > MAX_WORD_LENGTH
    ) {
    return false;
  }

  if (word.length === 1) 
    return true;

  word = word.toLowerCase();

  let wordLength = word.length;

  for (let i = 0; i < wordLength; i++) {
    let currentLetter = word[i];
    let currentLetterIndex = ALP.indexOf(currentLetter);

    let nextLetter = word[i + 1];
    let nextLetterIndex = ALP.indexOf(nextLetter);
    let currentLetterStat;

    if (nextLetter && stats[currentLetterIndex] !== null) 
      currentLetterStat = stats[currentLetterIndex][nextLetterIndex][wordLength - 2];

    if (!currentLetterStat) {
      if ((i + 1) === wordLength) 
        return true;

      return false;
    }

    let chanceCLtoSeeNL = currentLetterStat[i];

    if (
      chanceCLtoSeeNL != null && 
      (new RegExp(_getRegExp(word.slice(0, i + 1), wordLength - 2))).test(word.slice(0, i + 1))
      ) {
      continue;
    } else {
      return false;
    }
  }

  return true;
}

function _getRegExp (subString, lineLength) {
  let outputRegExp = '^';

  for (let i = 0; i < subString.length; i++) {
    let currentLetter = subString[i];
    let currentLetterIndex = ALP.indexOf(currentLetter);

    let nextLetter = subString[i + 1];
    let nextLetterIndex = ALP.indexOf(nextLetter);

    if (!nextLetter) {
      break;
    }

    let pattern = stats[currentLetterIndex][nextLetterIndex][lineLength][i];

    if (pattern) {
      if (typeof pattern !== 'string') 
        continue;

      pattern = pattern.replace(/[,\^]/g, '');

      if (pattern.length === 0) 
        continue;

      outputRegExp += '[' + (pattern) + ']';
    }
  }

  return outputRegExp;
}

module.exports = {
  init: data => {
    stats = JSON.parse(data.toString('utf8'));
  }, 
  test: testWord
};