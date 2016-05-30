module.exports = (word, test, done) => {
  var wrd;
  var e = 'e';
  var y = 'y';
  var t = 't';

  var sliceNAndAddChars = (re, n, chars) => {
    if (word.match(re) && test(wrd = word.slice(0, -n) + chars)) {
      return wrd;
    }
  };

  var sliceNAndTryAddChars = (re, n, chars) => {
    if (word.match(re)) {
      if (test(wrd = word.slice(0, -n))) {
        return wrd;
      }
      else if (test(wrd += chars)) {
        return wrd;
      }
    }
  };

  var sliceNOrM = (re, n, m) => {
    if (word.match(re)) {
      if (test(wrd = word.slice(0, -n))) {
        return wrd;
      }
      else if (m && test(wrd = word.slice(0, -m))) {
        return wrd;
      }
    }
  };

  var slice2AndAddY    = (re) => sliceNAndAddChars(re, 2, y);
  var slice3AndAddY    = (re) => sliceNAndAddChars(re, 3, y);
  var slice4AndAddY    = (re) => sliceNAndAddChars(re, 4, y);
  var slice5AndAddY    = (re) => sliceNAndAddChars(re, 5, y);
  var slice1AndAddE    = (re) => sliceNAndAddChars(re, 1, e);
  var slice2AndAddE    = (re) => sliceNAndAddChars(re, 2, e);
  var slice3AndAddE    = (re) => sliceNAndAddChars(re, 3, e);
  var slice3AndTryAddE = (re) => sliceNAndTryAddChars(re, 3, e);
  var slice4AndTryAddE = (re) => sliceNAndTryAddChars(re, 4, e);
  var slice1           = (re) => sliceNOrM(re, 1);
  var slice2           = (re) => sliceNOrM(re, 2);
  var slice3           = (re) => sliceNOrM(re, 3);
  var slice4           = (re) => sliceNOrM(re, 4);
  var slice2or1        = (re) => sliceNOrM(re, 2, 1);
  var slice3or2        = (re) => sliceNOrM(re, 3, 2);

  // REJECT POTENTIALLY INVALID WORD
  // -------------------------------

  if (
    word.match(/'([^s]|s.+|$)/) ||
    word.match(/jq|jx|jz|qj|qx|qz|vq|xj|zx/) ||
    word.match(/[bcdfghklmnpqrstvwxz]{5}/) ||
    word.match(/[aeijouy]{5}/) ||
    word.match(/([aeijouybcdfghklmnpqrstvwxz])\1\1/)
  ) {
    return false;
  }

  // CONFIRM POTENTIALLY VALID WORD
  // ------------------------------

  if (
    word.length <= 2
  ) {
    return word.indexOf("'") == -1;
  }

  if (
    word.match(/^\w's$/)
  ) {
    return true;
  }

  // PREFIXES
  // --------
  // Here we strip the prefix and continue to suffixes.

  var prefixRe = /^(anti|auto|bio|counter|dis|electro|en|fore|geo|hyper|intra|inter|iso|kilo|magneto|meta|micro|mid|milli|mis|mono|multi|non|out|over|photo|poly|pre|pseudo|psycho|re|semi|stereo|sub|super|tele|thermo|ultra|under|un)(.+)/;
  if (prefixRe.test(word) && test(wrd = word.replace(prefixRe, '$2'))) {
    word = wrd;
  }

  // REJECT LONG WORDS
  // -----------------
  // 14 is a magic number that gives the best results.

  if (
    word.length > 14
  ) {
    return false;
  }

  // SUFFIXES
  // --------

  if (
    // 's
    slice2(/'s$/) ||

    // Final -s. No other suffix can follow any of these.
    slice2or1(/(hes|ses|xes|zes)$/) ||
    slice1(/(he|se|xe|ze)$/) ||

    // The suffix -er and others treated similarly.
    slice3AndAddY(/(ier|ied|ies)$/) ||
    slice2or1(/^((?!at|ct).)*er$/) ||
    slice2or1(/(ed|es)$/) ||
    slice4AndAddY(/iest$/) ||
    slice3or2(/est$/) ||

    // The suffix -ing and others treated similarly.
    slice3AndTryAddE(/(ing|ist|ism|ity)$/) ||
    slice3(/ize$/) ||
    slice4AndTryAddE(/^((?!c|g).)*able$/) ||

    // Exceptions to the -ing rule.
    sliceNAndAddChars(/bility$/, 5, 'le') ||
    slice5AndAddY(/fiable$/) ||
    slice3AndAddY(/logist$/) ||

    // Suffixes that are simply replaced.
    slice2AndAddY(/(graphic|logic)$/) ||
    slice2(/(istic|mental|ical|ional)$/) ||
    slice2AndAddE(/itic$/) ||
    slice4(/(like|ment|ship)$/) ||
    sliceNAndAddChars(/metry$/, 2, 'er') ||
    sliceNAndAddChars(/(nce|ncy)$/, 2, t) ||

    // Suffixes -ly, -ful, etc., that are stripped except after i.
    slice1AndAddE(/bly$/) ||
    slice3AndAddY(/ily$/) ||
    slice2(/ly$/) ||
    slice4AndAddY(/iful$/) ||
    slice3(/ful$/) ||
    slice5AndAddY(/(ihood|iless|iness)$/) ||
    slice4(/(hood|less|ness)$/) ||

    // The suffix -tion and relatives.
    sliceNAndAddChars(/ification$/, 7, y) ||
    sliceNAndAddChars(/ization$/, 5, e) ||
    slice3(/(ction|rtion)$/) ||
    slice3AndAddE(/ation$/) ||
    slice2AndAddE(/ator$/) ||
    slice2(/ctor$/) ||
    sliceNAndAddChars(/ive$/, 2, 'on')
  ) {
    return done(wrd);
  }

  // FINAL REJECT
  // ------------

  // Assume the word at this stage is not valid (which is true in most cases).
  if (word.match(/'s$/)) {
    return false;
  }

  // Reject the most unpopular chars (based on processed data, not on original one).
  if (
    word.match(/['qjx]/)
  ) {
    return false;
  }

  // Try whether the word is valid without s ending.
  // Based on words analysis.
  if (
    slice1(/s$/)
  ) {
    return done(wrd);
  }

  return done(word);
};
