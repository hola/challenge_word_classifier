function test(data, word) {
    function stem(word) {
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

        return word.replace(/Y/g, 'y');
      }
     
      if (word.length <= 2) return word;
      return doStem(word);
    }

    function MurmurHashV3(key, seed) {
      var remainder, bytes, h1, h1b, c1, c1b, c2, c2b, k1, i;

      remainder = key.length & 3; // key.length % 4
      bytes = key.length - remainder;
      h1 = seed;
      c1 = 0xcc9e2d51;
      c2 = 0x1b873593;
      i = 0;

      while (i < bytes) {
          k1 =
            ((key.charCodeAt(i) & 0xff)) |
            ((key.charCodeAt(++i) & 0xff) << 8) |
            ((key.charCodeAt(++i) & 0xff) << 16) |
            ((key.charCodeAt(++i) & 0xff) << 24);
        ++i;

        k1 = ((((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16))) & 0xffffffff;
        k1 = (k1 << 15) | (k1 >>> 17);
        k1 = ((((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16))) & 0xffffffff;

        h1 ^= k1;
            h1 = (h1 << 13) | (h1 >>> 19);
        h1b = ((((h1 & 0xffff) * 5) + ((((h1 >>> 16) * 5) & 0xffff) << 16))) & 0xffffffff;
        h1 = (((h1b & 0xffff) + 0x6b64) + ((((h1b >>> 16) + 0xe654) & 0xffff) << 16));
      }

      k1 = 0;

      switch (remainder) {
        case 3: k1 ^= (key.charCodeAt(i + 2) & 0xff) << 16;
        case 2: k1 ^= (key.charCodeAt(i + 1) & 0xff) << 8;
        case 1: k1 ^= (key.charCodeAt(i) & 0xff);

        k1 = (((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16)) & 0xffffffff;
        k1 = (k1 << 15) | (k1 >>> 17);
        k1 = (((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16)) & 0xffffffff;
        h1 ^= k1;
      }

      h1 ^= key.length;

      h1 ^= h1 >>> 16;
      h1 = (((h1 & 0xffff) * 0x85ebca6b) + ((((h1 >>> 16) * 0x85ebca6b) & 0xffff) << 16)) & 0xffffffff;
      h1 ^= h1 >>> 13;
      h1 = ((((h1 & 0xffff) * 0xc2b2ae35) + ((((h1 >>> 16) * 0xc2b2ae35) & 0xffff) << 16))) & 0xffffffff;
      h1 ^= h1 >>> 16;

      return h1 >>> 0;
    }

    if (word.length > 15) return false
    if (word.match(/[^aeuioy']{4}/)) return false
    if (word.match(/'$|'[^s]|'s./)) return false
    if (!word.match(/[aeuio]/)) return false
    word = word.replace(/^un/,"")
    s = stem(word)
    h = MurmurHashV3(s) % (data.length * 8);
    return (data[Math.floor(h/8)] & (1 << (h % 8))) != 0;
}
