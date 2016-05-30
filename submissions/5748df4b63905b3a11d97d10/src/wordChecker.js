'use strict';

let failTags;


//функция принимает Buffer
function init(buffer) {
  failTags = buffer.toJSON();
}

function test(word) {
  let isGood = true;

  //фэйлим неправильные слова с апострофами
  if (word.indexOf('\'') !== -1 && !isValidWordWithApostroph(word)) {
    isGood = false;
  }

  //проверим на отсутствие согласных или гласных вообще
  if (/^[aeiouy]+$|^[qwrtpsdfghklzxcvbnm]+$/m.test(word)) {
    isGood = false;
  }

  if (isGood) {
    for (let failTag in failTags) {
      //проверка на стоп-морфемы, которые не встречаются в словаре
      if (word.indexOf(failTag) !== -1) {
        isGood = false;
        break;
      }
    }
  }
  return isGood;
}

function isValidWordWithApostroph(word) {
  //если в слове два подряд апострофа
  if (word.indexOf('\'\'') !== -1) {
    return false;
  }

  const arr = word.split('\'');

  //для слов с 3мя и более апострофами
  if (arr.length > 3) {
    return false;
  }

  //для слов начинающихся или заканчивающихся на апостроф
  if (arr[0] === '' || arr[arr.length - 1] === '') {
    return false;
  }

  //если это фамилии вида O'Reily
  if (arr[1] !== 's') {
    //для второго апострофа может быть окончание с 's
    if (arr[2] && arr[2] !== 's') {
      return false;
    }

    if (!(arr[0] === 'd' || arr[0] === 'l' || arr[0] === 'o')) {
      return false;
    }
  }

  return true;
}

module.exports = init;
module.exports = test;
