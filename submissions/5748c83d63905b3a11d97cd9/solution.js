'use strict';

var dictionary;

var init = function (data) {
  var file = data.toString('utf8');
  dictionary = file.split('\n');
};

var test = function (word) {
  console.log("Testing " + word);
  var inDict = dictionary.indexOf(word) > -1;
  if(inDict){

    return true;

  } else {

    var validWord = /^[a-z']+$/.test(word);

    if(!validWord){

      console.log("Invalid word.");

      return false;

    }

    var noVowels = /^[^aeiou]+$/.test(word);
    if(noVowels){
      console.log("No vowels.");

      return false;
    }

    if(word.length >= 20 || word.length <= 4 || word.length === 18){
      return false;
    }

    var wordLength = word.length;
    var vowelCount = word.match(/[aeiou]/gi).length;
    var ratio = (wordLength / vowelCount).toPrecision(2);

    var rareRatios = [
      '1.0',
      '1.2',
      '1.3',
      '1.4',
      '1.5',
      '1.6',
      '1.7',
      '1.9',
      '10',
      '11',
      '12',
      '3.4',
      '3.6',
      '3.8',
      '4.7',
      '4.8',
      '5.3',
      '5.7',
      '6.5',
      '7.5',
      '8.0',
      '9.0'
    ];

    if(rareRatios.indexOf(ratio) > -1){
      return false;
    }

    var hasQ  = /^.*q.*$/.test(word);
    if(hasQ){
      return false;
    }

    var hasZ  = /^.*z.*$/.test(word);
    if(hasZ){
      return false;
    }

    var apostropheIsNotAtEnd = /^.*'.{2,}$/.test(word);
    if(apostropheIsNotAtEnd){
      return false;
    }

    var commonRatios = ['1.8',
     '2.0', '2.1', '2.2', '2.3', '2.4', '2.5', '2.6', '2.7',
      '2.8', '3.0', '3.3', '3.5', '3.7', '4.0',
       '4.5'];

    if(commonRatios.indexOf(ratio) > -1){
      return true;
    }

    return false;

  }
};

module.exports = {init: init, test: test};
