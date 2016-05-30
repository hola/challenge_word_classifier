var BloomFilter = function (buckets, hashes) {
  this.numBuckets = buckets;
  this.numHashes = hashes;
  this.bitVector = new Buffer(this.numBuckets).fill(0);
}

function set(n, bitVector) {
  bitVector[Math.floor(n / 8)] |= 1 << (n - index * 8);
}

/**
 * Adds a value to the filter set.
 * @param value The value to add to the set.
 */
BloomFilter.prototype.add = function (value) {
  this.hashify(String(value), function (index, bitVector) { set(index, bitVector); });
}

/**
 * Tests whether a given value is a member of the filter set.
 * @param value The value to test for.
 * @return False if not in the set. True if likely to be in the set.
 */
BloomFilter.prototype.contains = function (value) {
  var result = true;
  this.hashify(String(value), function (index, bitVector) { result = !!(bitVector[index >>> 3] & (1 << (index % 8))) });
  return result;
}

/**
 * Calculates hashes on the given value and involkes operator on each of the values.
 * @param value The value to hashify.
 * @param operator The function to call on all hash values individually.
 */
BloomFilter.prototype.hashify = function (value, operator) {
  // We can calculate many hash values from only a few actual hashes, using the method 
  // described here: http://www.eecs.harvard.edu/~kirsch/pubs/bbbf/esa06.pdf
  var hash1 = hash(value, 0);
  // Generate indexes using the function: 
  // h_i(x) = (h1(x) + i * h2(x)) % numBuckets
  var index = Math.abs((hash1 + hash(value, hash1)) % this.numBuckets);
  operator(index, this.bitVector);
}
/**
 * Loads the given filter data.
 * @param data The filter data as a byte array.
 * @return True if successful, false otherwise.
 */
BloomFilter.prototype.loadData = function (data) {
  // TODO: We should probably validate the data.
  this.bitVector = data;
}

/***** Hash Functions *********/
// Abstraction wrapper function to make it easier to swap in hash functions later.
function hash(value, seed) {
  return murmurhash3_32_gc(value, seed);
}

function murmurhash3_32_gc(key, seed) {
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

const stem = (function () {
  var stemmer = {}, cache = {};

  stemmer.except = function (word, exceptions) {
    if (exceptions instanceof Array) {
      if (~exceptions.indexOf(word)) return word;
    } else {
      for (var k in exceptions) {
        if (k === word) return exceptions[k];
      }
    }
    return false;
  }

  // word - String
  // offset - Integer (optional)
  // replace - Key/Value Array of pattern, string, and function.
  stemmer.among = function among(word, offset, replace) {
    if (!replace) return among(word, 0, offset);

    // Store the intial value of the word.
    var initial = word.slice(), pattern, replacement;

    for (var i = 0; i < replace.length; i += 2) {
      pattern = replace[i];
      pattern = cache[pattern] || (cache[pattern] = new RegExp(replace[i] + "$"));
      replacement = replace[i + 1];

      if (typeof replacement === "function") {
        word = word.replace(pattern, function (m) {
          var off = arguments["" + (arguments.length - 2)];
          if (off >= offset) {
            return replacement.apply(null, arguments);
          } else {
            return m + " ";
          }
        })
      } else {
        word = word.replace(pattern, function (m) {
          var off = arguments["" + (arguments.length - 2)];
          return (off >= offset) ? replacement : m + " ";
        })
      }

      if (word !== initial) break;
    }

    return word.replace(/ /g, "");
  }

  var alphabet = "abcdefghijklmnopqrstuvwxyz"
    , vowels = "aeiouy"
    , consonants = alphabet.replace(RegExp("[" + vowels + "]", "g"), "") + "Y"
    , v_wxy = vowels + "wxY"
    , valid_li = "cdeghkmnrt"
    , r1_re = RegExp("^.*?([" + vowels + "][^" + vowels + "]|$)")
    , r1_spec = /^(gener|commun|arsen)/
    , doubles = /(bb|dd|ff|gg|mm|nn|pp|rr|tt)$/
    , y_cons = RegExp("([" + vowels + "])y", "g")
    , y_suff = RegExp("(.[^" + vowels + "])[yY]$")
    , exceptions1 =
      {
        skis: "ski"
        , skies: "sky"
        , dying: "die"
        , lying: "lie"
        , tying: "tie"

        , idly: "idl"
        , gently: "gentl"
        , ugly: "ugli"
        , early: "earli"
        , only: "onli"
        , singly: "singl"

        , sky: "sky"
        , news: "news"
        , howe: "howe"

        , atlas: "atlas"
        , cosmos: "cosmos"
        , bias: "bias"
        , andes: "andes"
      }
    , exceptions2 =
      ["inning", "outing", "canning", "herring", "earring"
        , "proceed", "exceed", "succeed"
      ];

  return function (word) {
    // Exceptions 1
    var stop = stemmer.except(word, exceptions1)
    if (stop) return stop;

    // No stemming for short words.
    if (word.length < 3) return word;

    // Y = "y" as a consonant.
    if (word[0] === "y") word = "Y" + word.substr(1);
    word = word.replace(y_cons, "$1Y");

    // Identify the regions of the word.
    var r1, m;
    if (m = r1_spec.exec(word)) {
      r1 = m[0].length;
    } else {
      r1 = r1_re.exec(word)[0].length;
    }

    var r2 = r1 + r1_re.exec(word.substr(r1))[0].length;

    // Step 0
    word = word.replace(/^'/, "");
    word = word.replace(/'(s'?)?$/, "");

    // Step 1a
    word = stemmer.among(word,
      ["sses", "ss"
        , "(ied|ies)", function (match, _, offset) {
          return (offset > 1) ? "i" : "ie"
        }
        , "([" + vowels + "].*?[^us])s", function (match, m1) { return m1 }
      ]);

    stop = stemmer.except(word, exceptions2);
    if (stop) return stop;

    // Step 1b
    word = stemmer.among(word,
      ["(eed|eedly)", function (match, _, offset) {
        return (offset >= r1) ? "ee" : match + " ";
      }
        , ("([" + vowels + "].*?)(ed|edly|ing|ingly)"), function (match, prefix, suffix, off) {
          if (/(?:at|bl|iz)$/.test(prefix)) {
            return prefix + "e";
          } else if (doubles.test(prefix)) {
            return prefix.substr(0, prefix.length - 1);
          } else if (shortv(word.substr(0, off + prefix.length)) && off + prefix.length <= r1) {
            return prefix + "e";
          } else {
            return prefix;
          }
        }
      ])

    // Step 1c
    word = word.replace(y_suff, "$1y");

    // Step 2
    word = stemmer.among(word, r1,
      ["(izer|ization)", "ize"
        , "(ational|ation|ator)", "ate"
        , "enci", "ence"
        , "anci", "ance"
        , "abli", "able"
        , "entli", "ent"
        , "tional", "tion"
        , "(alism|aliti|alli)", "al"
        , "fulness", "ful"
        , "(ousli|ousness)", "ous"
        , "(iveness|iviti)", "ive"
        , "(biliti|bli)", "ble"
        , "ogi", function (m, off) {
          return (word[off - 1] === "l") ? "og" : "ogi";
        }
        , "fulli", "ful"
        , "lessli", "less"
        , "li", function (m, off) {
          return ~valid_li.indexOf(word[off - 1]) ? "" : "li";
        }
      ]);

    // Step 3
    word = stemmer.among(word, r1,
      ["ational", "ate"
        , "tional", "tion"
        , "alize", "al"
        , "(icate|iciti|ical)", "ic"
        , "(ful|ness)", ""
        , "ative", function (m, off) {
          return (off >= r2) ? "" : "ative";
        }
      ]);

    // Step 4
    word = stemmer.among(word, r2,
      ["(al|ance|ence|er|ic|able|ible|ant|ement|ment|ent|ism|ate|iti|ous|ive|ize)", ""
        , "ion", function (m, off) {
          return ~"st".indexOf(word[off - 1]) ? "" : m;
        }
      ]);

    // Step 5
    word = stemmer.among(word, r1,
      ["e", function (m, off) {
        return (off >= r2 || !shortv(word, off - 2)) ? "" : "e";
      }
        , "l", function (m, off) {
          return (word[off - 1] === "l" && off >= r2) ? "" : "l";
        }
      ]);

    return word.replace(/Y/g, "y");
  }


  function shortv(word, i) {
    if (i == null) i = word.length - 2;
    if (word.length < 3) i = 0;//return true
    return !!((!~vowels.indexOf(word[i - 1]) &&
      ~vowels.indexOf(word[i]) &&
      !~v_wxy.indexOf(word[i + 1]))
      || (i === 0 &&
        ~vowels.indexOf(word[i]) &&
        !~vowels.indexOf(word[i + 1])));
  }

  // Check if the word is short.
  function short(word, r1) {
    return r1 >= word.length && shortv(word, l - 2);
  }
})();

const filter = new BloomFilter(479224, 1);
module.exports = {
  init: function (data) {
    filter.loadData(data);
  },

  test: function (word) {
    const condition = word.length < 15 && word.match(/^[A-Z]/i);
    return condition && filter.contains(stem(word));
  }
};