var myModule = (function () {

  //Global var for containing tha data-matrix
  var dataMatrix;

  /**
   * Initialization function for decompressing data and creating
   * data-matrix for tests
   *
   * @param    {Buffer}      data    Compressed data as Buffer
   *
   */
  var init = function init(data) {

    //Convert Buffer to string
    var array = data.toString();

    array = array.split('%');

    var matrix = [];

    //Start indexes of words with length 3-25
    matrix[0] = array[0].split(',');

    //Convert string with 2-letters words to array
    matrix[1] = array[1].match(/[\S\s]{1,2}/g);

    //Convert string with words, which length more than 25, to array
    matrix[2] = array[2].split(',');

    //Begin to convert strings compressed with RLE to bit-array with "0" and "1"
    for (var i = 3; i < array.length; i++) {
      matrix[i] = [];
      var bit = 1;

      //will contain binary count of repetition
      var count = '';

      //Cycle for compressed with RLE string
      for (var j = 0; j < array[i].length; j++) {

        //If j-th element is "a" or "b" we convert "a" to "0" and "b" to "1"
        // and get count of its' repetition
        if (array[i][j] === 'b' || array[i][j] === 'a') {
          bit = array[i][j] === 'b' ? 1 : 0;

          //If count of repetition not empty string wi convert binary number
          // 10-th system
          if (count !== '') {

            count = parseInt(count, 2);

            //Cycle for fillthe global matrix for tests
            for (var n = 0; n < count; n++) {
              matrix[i].push(bit);
            }

            //Set count str to empty str again
            count = '';
          }

          //If count empty we just push one bit to matrix
          else {
            bit = array[i][j] === 'b' ? 1 : 0;
            matrix[i].push(bit);
          }

        }
        //If we haven't "a" or "b" we add binary number to var of count
        // of repetition. We add it like string by concatenation
        else {
          count += array[i][j];
        }

      }
    }

    //Add alphabet of allowed symbols
    matrix.push("abcdefghijklmnopqrstvuwxyz'");

    //Assign matrix to global dataMatrix, because we need access to matrix
    // in test() function
    dataMatrix = matrix;
  }

  /**
   *Function for testing is function parameter word or not. Function returns
   * true if it's word or false if it's not
   *
   * @param    {string}      testWord     String with word for test
   *
   * @returns  {boolean}                  Is word real(true) or not(false)
   */
  var test = function test(testWord) {

    //Length of current word
    var wLength = testWord.length;


    /**
     *Function for calculating of word sum by formula and letters coefficients
     *
     * @param    {string}      word         String with word for test
     *
     * @returns  {integer}                  Calculated word's sum
     */

    function getWordSum(word) {
      //Array with each letter coefficient
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

      //Set sum to 0
      var wordSum = 0;

      //Cycle for getting sum of each letter and adding it to word sum
      for (var i = 0; i < wLength; i++) {

        //Letter sum formula
        wordSum += lettersArr[word[i]] * 0.29 * (51 - word.length - i) * word.length;
      }

      // Returns rounded integer value of sum minus word length array begin index
      return Math.round(wordSum) - dataMatrix[0][wLength - 3];
    }

    /**
     *Function returns true if word is real and false if it's not
     *
     * @param    {string}      word         String with word for test
     *
     * @returns  {boolean}                  Is word real(true) or not(false)
     */

    function isWord(word) {

      var wLength = testWord.length;

      //Set result to false
      var boolResult = false;

      //If 1 letter and it's not "'" result true
      if (wLength == 1 && testWord !== dataMatrix[26][26]) {
        boolResult = true;
      }

      //2-symbols works with compare word with all words in array with nonexistent
      // double symbols
      else if (wLength == 2) {

        //Set result to true at first
        boolResult = true;

        // If non of 2 symbold isn't "'"
        if (word[0] !== dataMatrix[26][26] && word[1] !== dataMatrix[26][26]) {

          //Cycle for nonexistent double symbols array
          for (var i = 0; i < dataMatrix[1].length; i++) {

            //if word is in nonexistent double symbols array, it's not a word
            if (dataMatrix[1][i] === word) {
              boolResult = false;
              break;
            }

          }
        }

        // If one of 2 symbold is "'" it's not a word
        else {
          boolResult = false;
        }
      }

      //If word length more than 25 we compare it wir array, which contain
      // all real words longer than 25
      else if (wLength > 25) {

        //Cycle for array with word longer than 25 symbols
        for (var i = 0; i < dataMatrix[2].length; i++) {

          //if we have match it's the real word
          if (dataMatrix[2][i] === word) {
            boolResult = true;
            break;
          }

        }

      }

      //If word length is between 3 and 25 we just calculate word sum and
      // then search in test matrix if in test[length of the
      // word][calculated word sum] is "0" or "1". If "1" - it's word, else
      // - it's not a word.
      else {

        if (dataMatrix[wLength][getWordSum(word)] == 1) { boolResult = true;}

      }

      //Return true if word is real and false if it's not
      return boolResult;
    }

    //Return true if word is real and false if it's not
    return isWord(testWord);

  }

  //Return object with global var and 2 functions. It object will use for
  // exporting
  return {
    dataMatrix: dataMatrix,
    init: init,
    test: test
  }

})();

//Exporting object with global var and 2 functions: init() and test()
module.exports = myModule;



