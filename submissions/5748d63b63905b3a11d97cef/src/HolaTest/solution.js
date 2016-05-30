(() => {
  var apostrophe = "'";
  var vowelsMaxCountInRow = 4;
  var consonantsMaxCountInRow = 4;
  var vowels = "aeiouy";
  var wordsLengths = [0, 1, 2, 3, 4, 5, 6, 7, 7, 7, 7, 7, 8, 8, 8, 8];
  var maxWordLength = 15;
  var postfixes = ["ing", "es", "ed", "ly", "s", "e"];
  var prefixes = ["dis", "un", "co", "re", "pr", "no", "in", "de"];
  var byteSize = 8;

  var bytes = [];
  var bitsCount = 520019;

  var endings = [];
  var endingsBitsCount = 9697;

  var absents = [];

  var maxCountInRow = (str, predicate) => {
    var count = 0;
    var maxCount = 0;
    for (var letter of str) {
      count = predicate(letter) ? count + 1 : 0;
      if (count > maxCount) {
        maxCount = count;
      }
    }
    return maxCount;
  };

  var clipString = (str) => {
    return str.substr(0, wordsLengths[Math.min(str.length, maxWordLength)]);
  };

  var validate = (word) => {
    return !(maxCountInRow(word, letter => !(vowels.indexOf(letter) > -1)) > consonantsMaxCountInRow
      || maxCountInRow(word, letter => vowels.indexOf(letter) > -1) > vowelsMaxCountInRow
      //|| word.length > 14 && "jq".indexOf(word[14]) > -1
      || word.length > maxWordLength);
  };

  var fnv1a = (word, size) => {
    var hash = 2166136261;
    for (var letter of word) {
      hash = hash ^ letter.charCodeAt(0);
      hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    }
    hash = hash >>> 0;
    return hash % size;
  };

  var getBit = (data, index) => {
    var byteIndex = Math.floor(index / byteSize);
    var b = data[byteIndex];
    var bitIndex = index % byteSize;
    return ((b >> bitIndex) & 1) === 1;
  };

  exports.init = (data) => {
    var readByte = () => data.readUInt8(offset++);

    var endingsBytesCount = Math.ceil(endingsBitsCount / byteSize);
    var bytesCount = Math.ceil(bitsCount / byteSize);

    var offset = 0;
    for (offset = 0; offset < bytesCount; offset++) {
      bytes.push(data[offset]);
    }

    for (var i = 0; i < 7; i++) {
      var absent = {
        a: readByte(),
        b: readByte(),
        c: readByte(),
        d: readByte(),
        s: []
      };
      var substringsCount = data.readInt16LE(offset);
      offset += 2;
      for (var j = 0; j < substringsCount; j++) {
        absent.s.push(data.toString("utf8", offset, offset + 2));
        offset += 2;
      }
      absents.push(absent);
    }

    for (var i = 0; i < endingsBytesCount; i++) {
      endings.push(data[offset + i]);
    }
  };

  exports.test = (word) => {
    var index = word.lastIndexOf(apostrophe);
    if (index === word.length - 1) {
      return false;
    }
    var testWord = index >= 0 ? word.substr(0, index) : word;
    var ending = index >= 0 ? word.substr(index + 1) : null;
    testWord = testWord.replace(apostrophe, "");

    if (!testWord) {
      return false;
    }

    if (ending && !getBit(endings, fnv1a(ending, endingsBitsCount))) {
      return false;
    }

    for (var absent of absents) {
      for (var str of absent.s) {
        if (testWord.length >= absent.a && testWord.length <= absent.b) {
          var i = testWord.indexOf(str, absent.c);
          if (i >= absent.c && i <= absent.d) {
            return false;
          }
        }
      }
    }

    if (!validate(testWord) || !validate(word.replace(apostrophe, ""))) {
      return false;
    }

    for (var postfix of postfixes) {
      if (testWord.length > 5 && testWord.endsWith(postfix)) {
        testWord = testWord.substr(0, testWord.length - postfix.length);
        break;
      }
    }

    for (var prefix of prefixes) {
      if (testWord.length > 7 && testWord.startsWith(prefix)) {
        testWord = testWord.substr(prefix.length);
        break;
      }
    }

    testWord = clipString(testWord);
    return getBit(bytes, fnv1a(testWord, bitsCount));
  };
})();