/* Javascript implementation of the Porter2 Stemmer */
/* http://snowball.tartarus.org/algorithms/english/stemmer.html */

(function (module) {
  var VOWELS = ['a', 'e', 'i', 'o', 'u', 'y'],
      DOUBLES = ['bb', 'dd', 'ff', 'gg', 'mm', 'nn', 'pp', 'rr', 'tt'],
      VALID_LI_ENDINGS = ['c', 'd', 'e', 'g', 'h', 'k', 'm', 'n', 'r', 't'],
      VOWEL = '[' + VOWELS.join('') + ']',
      NON_VOWEL = '[^' + VOWELS.join('') + ']',
      R1 = new RegExp('^' + NON_VOWEL + '*' + VOWEL + '+' + NON_VOWEL),
      R2 = new RegExp('^' + NON_VOWEL + '*' + VOWEL + '+' + NON_VOWEL + '+' + VOWEL + '+' + NON_VOWEL),
      HAS_VOWEL = new RegExp(VOWEL),
      ENDS_IN_DOUBLE = new RegExp('(' + DOUBLES.join('|') + ')$'),
      VOWELS_BEFORE_Y = new RegExp('(' + VOWEL + '])y', 'g'),
      VOWEL_NOT_IMMEDIATELY_BEFORE_FINAL_S = new RegExp(VOWEL + '.+' + 's$'),
      SHORT = new RegExp('(^|' + NON_VOWEL + ')' + VOWEL + NON_VOWEL + '$');

  function r1(word) {
    var matches = word.match(R1);
    return matches && matches[0].length || word.length;
  }

  function r2(word) {
    var matches = word.match(R2);
    return matches && matches[0].length || word.length;
  }

  function step0(word) {
    return word.replace(/[\'‘’](s[\'‘’]?)?$/, '');
  }

  function step1a(word) {
    if (word.match(/sses$/)) {
      word = word.replace(/sses$/, 'ss');
    } else if (word.match(/ie[ds]$/)) {
      word = word.replace(/ie[ds]$/, (word.length > 4) ? 'i' : 'ie');
    } else if (word.match(/[us]s$/)) {
      // do nothing
    } else if (word.match(/s$/)) {
      if (word.match(VOWEL_NOT_IMMEDIATELY_BEFORE_FINAL_S)) {
        word = word.substr(0, word.length - 1);
      }
    }
    return word;
  }

  function step1b(word) {
    var match;

    if (word.match(/eed(ly)?$/)) {
      if (word.substr(r1(word)).match(/eed(ly)?$/)) {
        word = word.replace(/eed(ly)?$/, '');
      }
    } else if (match = word.match(/(.*)(ed|ing)(ly)?$/)) {
      if (match[1].match(HAS_VOWEL)) {
        word = match[1];
        if (word.match(/(at|bl|iz)$/)) {
          word += 'e';
        } else if (word.match(ENDS_IN_DOUBLE)) {
          word = word.substr(0, word.length - 1);
        } else if (word.match(SHORT)) {
          word += 'e';
        }
      }
    }

    return word;
  }

  function step1c(word) {
    if (word.length > 2 && VOWELS.indexOf(word[word.length - 2]) == -1) {
      word = word.replace(/[yY]$/, 'i');
    }

    return word;
  }

  function replaceWithList(word, replacements) {
    var replaced, replacement;

    for (var i = 0; i < replacements.length; i++) {
      replacement = replacements[i];
      if ((replaced = word.replace(replacement[0], replacement[1])) != word) {
        return replaced;
      }
    }

    return word;
  }

  var STEP_2_REPLACEMENTS = [
    [/ization$/, 'ize'],
    [/ational$/, 'ate'],
    [/(ful|ous|ive)ness$/, '$1'],
    [/biliti$/, 'ble'],
    [/tional$/, 'tion'],
    [/lessli$/, 'less'],
    [/entli$/, 'ent'],
    [/ation$/, 'ate'],
    [/al(ism|iti)$/, 'al'],
    [/iviti$/, 'ive'],
    [/ousli$/, 'ous'],
    [/fulli$/, 'ful'],
    [/(e|a)nci$/, '$1nce'],
    [/abli$/, 'able'],
    [/i(s|z)er$/, 'i$1e'],
    [/ator$/, 'ate'],
    [/alli$/, 'al'],
    [/logi$/, 'log'],
    [/bli$/, 'ble'],
    [/([cdeghkmnrt])li$/, '$1']
  ]

  function step2(word) {
    return replaceWithList(word, STEP_2_REPLACEMENTS);
  }

  var STEP_3_REPLACEMENTS = [
    [/ational$/, 'ate'],
    [/tional$/, 'tion'],
    [/alize$/, 'al'],
    [new RegExp('^(' + NON_VOWEL + '*' + VOWEL + '+' + NON_VOWEL + '+' + VOWEL + '+' + NON_VOWEL + '.*)ative$'), ''],
    [/ic(ate|iti|al)$/, 'ic'],
    [/(ness|ful)$/, '']
  ];

  function step3(word) {
    return replaceWithList(word, STEP_3_REPLACEMENTS);
  }

  var STEP_4_REPLACEMENTS = [
    [/^(.*)(ement|ance|ence|able|ible|ment)$/, '$1'],
    [/^(.*)([st])ion$/, '$1$2'],
    [/^(.*)(ant|ent|ism|ate|iti|ous|ive|ize)$/, '$1'],
    [/^(.*)(al|er|ic)$/, '$1']
  ];

  function step4(word) {
    var replacement, match;

    for (var i = 0; i < STEP_4_REPLACEMENTS.length; i++) {
      replacement = STEP_4_REPLACEMENTS[i];
      match = word.match(replacement[0]);
      if (match && (match[1].length >= r2(word))) {
        return word.replace(replacement[0], replacement[1]);
      }
    }

    return word;
  }

  function step5(word) {
    var last = word[word.length - 1], chopped = word.substr(0, word.length - 1);
    if (last == 'e') {
      if (word.length > r2(word) || (word.length > r1(word) && !chopped.match(SHORT))) {
        return chopped;
      } else {
        return word;
      }
    } else if (last == 'l' && word[word.length - 2] == 'l' && word.length > r2(word)) {
      return chopped;
    } else {
      return word;
    }
  }

  function doStem(word) {
    word = word
      .replace('/^[\'‘’]/', '')
      .replace(/^y/, 'Y')
      .replace(VOWELS_BEFORE_Y, '$1Y');

    word = step0(word);
    word = step1a(word);

    word = step1b(word);
    word = step1c(word);
    word = step2(word);
    word = step3(word);
    word = step4(word);
    //word = step5(word);

    return word.replace(/Y/g, 'y');
  }

  function stem(word) {
    if (word.length <= 2) return word;
    return doStem(word);
  }

  function stemAll(text) {
    var tokenise = /[\w'‘’]+/g, match, output = '', space = '';

    while (match = tokenise.exec(text)) {
      output += space + stem(match[0]);
      space = ' ';
    }
    return output;
  }

  module.exports = this.Porter2 = {
    stem: stem,
    stemAll: stemAll
  };
})(typeof module !== 'undefined' && module !== null ? module : {});
