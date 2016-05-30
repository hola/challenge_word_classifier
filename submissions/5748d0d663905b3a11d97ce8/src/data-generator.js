var fs = require('fs');


//String with allowed symbols
var alphabet = "abcdefghijklmnopqrstvuwxyz'";

//Read content from vocabulary
var contents = fs.readFileSync('voc.txt', 'utf8');

//Convert vocabulary to array of words in low register
contents = contents.toLowerCase().split('\r\n');


/**
 * Returns integer value, which is the word sum, calculated by formula
 *
 * @param    {string}      word     String with word we need to calculate
 *
 * @returns  {number}     integer   Calculated word sum
 *
 */
function getWordSum(word) {
  //Array with letters coefficients for formula
  var lettersArr = {
    "e": 12,
    "s": 5.26,
    "a": 6.75,
    "i": 6.96,
    "n": 9.67,
    "o": 9.87,
    "r": 9.91,
    "t": 11.43,
    "l": 14.06,
    "c": 20.14,
    "u": 24.84,
    "d": 28.34,
    "m": 28.88,
    "p": 29.28,
    "h": 32.52,
    "'": 42.47,
    "g": 44.13,
    "b": 55.19,
    "y": 56.72,
    "f": 75.25,
    "k": 89.64,
    "v": 89.93,
    "w": 111.44,
    "z": 148.39,
    "x": 189.27,
    "j": 150.56,
    "q": 180.88
  };
  var wordSum = 0;
  var wLength = word.length;

  //Calculate every letter and get them sum
  for (var i = 0; i < wLength; i++) {
    wordSum += lettersArr[word[i]] * 0.29 * (51 - wLength - i) * wLength;
  }

  //We need only integer value, so we use Math.round
  return Math.round(wordSum);
}

/**
 * Creates all possible combination with 2 letters.
 *
 * @param    {sting}      str     String with all possible letters
 *
 * @returns  {array}              Array with all possible words with 2 letters
 *
 */

function createDoubleLettersArray(str) {
  var output = [];

  //First letter cycle
  for (var i = 0; i < str.length; i++) {
    //Second letter cycle
    for (var j = 0; j < str.length; j++) {
      output.push(alphabet[i] + alphabet[j]);
    }

  }

  return output;
}

/**
 * Creates and returns array with arrays inside. Main array's indexes (from
 * 3 to 25) are the length of words. Index 1 - nonexistent double symbols
 * words. Inside arrays (3-25) contain count of words which sum is equal index of cell.
 *
 * @param    {array}      data         Vocabulary array
 * @param    {array}      dLetters     Array with all possible words with 2 letters
 *
 * @returns  {array}                   Array of arrays
 *
 */
function createLengthArrays(data, dLetters) {
//Output array
  var lengthArray = [];
  lengthArray[2] = [];


//Cycle for all words in vocabulary arrray
  for (var i = 0; i < data.length; i++) {

    //Get length of current word
    var wordLength = data[i].length;

    if (wordLength == 2) {
      //Cycle fox exception from double lerrers words array. If we find word
      // in vocabulary we delete it from dubleLetters array.
      for (var j = 0; j < dLetters.length; j++) {
        if (data[i] == dLetters[j]) {
          dLetters.splice(j, 1);
        }
      }
    }
    else if (wordLength > 2 && wordLength < 26) {
      //If main array have no index which equal length of word, we create it
      // and make it array too
      if (!lengthArray[wordLength]) {
        lengthArray[wordLength] = [];
      }
      //Get word sum if current word
      var wordSum = getWordSum(data[i]);

      //If length array have no index which equal wordsum, we create it and
      // set it 1
      if (!lengthArray[wordLength][wordSum]) {
        lengthArray[wordLength][wordSum] = 1;
      }
      //Else increased value by 1
      else {
        lengthArray[wordLength][wordSum]++;
      }
    }
    else if (wordLength > 25) {
      //If word length more than 25 we just add full word to array
      lengthArray[2].push(data[i]);
    }
  }
//Convert dubleLetters words array to string
  lengthArray[1] = dLetters.join('');
  //Convert words longer then 25 symbols to string with "," separator
  lengthArray[2] = lengthArray[2].join(',');

  return lengthArray;
}

/**
 * Convert Array's of arrays values to 1 or 0. If value >= 1, then value =
 * 1, else value = 0. Only length arrays from 3 to 25
 *
 * @param    {array}      arr     Array of arrays
 *
 * @returns  {array}              Array of arrays with bit values
 *
 */

function toBit(arr) {
//Length array cycle
  for (var i = 3; i < 26; i++) {

    //Inside length array cycle
    for (var j = 0; j < arr[i].length; j++) {

      //if empty then 0
      if (!arr[i][j]) arr[i][j] = 0;
      //else 1
      if (arr[i][j] > 1) arr[i][j] = 1;

    }

  }


}

/**
 * In inside  length arrays deletes premiere nils and writes indexes of first
 * "1" in each length array
 *
 * @param    {array}      arr     Array of arrays
 *
 */
function arrayOptimizer(arr) {
  var beginIndexes = [];
  //Cycle for array of length between 3 and 25
  for (var i = 3; i < 26; i++) {

    //Cycle inside length array
    for (var j = 0; j < arr[i].length; j++) {

      //If we see "0" just continue cycle
      if (arr[i][j] === 0) continue;

      else {
        //Push index of first "1" in current length array
        beginIndexes.push(j);
        //Remove premiere nils until first "1"
        arr[i] = arr[i].slice(j, arr[i].length);
        //break cycle, because we optimized i-th length array
        break;
      }

    }

    //Convert indexes of first "1" of each arrays between 3 and 25 to string
    arr[0] = beginIndexes.join(',');

  }

}

/**
 * Compresses matrix with method RLE. Convert "0" to "a", "1" to "b". And
 * converts length arrays to strings
 *
 * @param    {array}      arr     Array of arrays
 *
 * @returns  {array}              Array of optimized and compressed data
 */

function compressionRLE(arr) {
  var output = [];
  output[0] = arr[0];
  output[1] = arr[1];
  output[2] = arr[2];

  //Main array cycle
  for (var i = 3; i < arr.length; i++) {
    output[i] = '';
    console.log(i);

    //Cerrent element bit: "0" or "1"
    var bit = 1;

    //Count the same bit in a row
    var bitCount = 0;

    //Cycle for length string
    for (var j = 0; j < arr[i].length; j++) {

      //If the same bit as previous
      if (bit == arr[i][j]) {
        bitCount++;
        continue;
      }
      //If other bit
      else {
        //if bit = 1 we convert it to "b", else convert it to "a"
        var symb = bit == 1 ? 'b' : 'a';

        //Count of bit repetitions we convert to binary system for the best
        // gzip-compression in a future
        bitCount = bitCount.toString(2);

        //If count of repetition is only 1, we don't need it to write, so
        // exchange it to empty string
        if (bitCount == 1) bitCount = '';

        //Write compressed part of binary string to result array
        output[i] += bitCount + symb;

        //Set count of repetition to 1
        bitCount = 1;

        //Set current bit
        bit = arr[i][j];
      }
    }

  }
  return output;
}

//Create array with all possible 2-symbols combination
var doubleLetters = createDoubleLettersArray("abcdefghijklmnopqrstvuwxyz");

//Create main array
var temporaryArray = createLengthArrays(contents, doubleLetters);

//Convert values of arrays of word with length 3-25 to bits
toBit(temporaryArray);

//Optimize array, catting premiere nils
arrayOptimizer(temporaryArray);

console.log('RLE begin');
//Compress array with method RLE
var systemRLE = compressionRLE(temporaryArray);
console.log('RLE end');

console.log('begin write');
//Write to data.txt-file string with separator "%" between ex-arrays
fs.writeFileSync('data.txt', systemRLE.join('%'));
console.log('end write');