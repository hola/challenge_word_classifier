var sp = (function() {
    function except(word, exceptions) {
        if (exceptions instanceof Array) {
            if (~exceptions.indexOf(word)) return word
        } else {
            for (var k in exceptions) {
                if (k === word) return exceptions[k]
            }
        }
        return false
    }

    function among(word, offset, replace) {
        if (replace == null) return among(word, 0, offset)

        var initial = word.slice()
            , pattern, replacement

        for (var i = 0; i < replace.length; i+=2) {
            pattern = replace[i]
            pattern = cache[pattern] || (cache[pattern] = new RegExp(replace[i] + "$"))
            replacement = replace[i + 1]

            if (typeof replacement === "function") {
                word = word.replace(pattern, function(m) {
                    var off = arguments["" + (arguments.length - 2)]
                    if (off >= offset) {
                        return replacement.apply(null, arguments)
                    } else {
                        return m + " "
                    }
                })
            } else {
                word = word.replace(pattern, function(m) {
                    var off = arguments["" + (arguments.length - 2)]
                    return (off >= offset) ? replacement : m + " "
                })
            }

            if (word !== initial) break
        }

        return word.replace(/ /g, "")
    }

    function shortv(word, i) {
        if (i == null) i = word.length - 2
        if (word.length < 3) i = 0//return true
        return !!((!~vowels.indexOf(word[i - 1]) &&
        ~vowels.indexOf(word[i]) &&
        !~v_wxy.indexOf(word[i + 1]))
        || (i === 0 &&
        ~vowels.indexOf(word[i]) &&
        !~vowels.indexOf(word[i + 1])))
    }

    var vowels = "aeiouy"
        , v_wxy = vowels + "wxY"
        , valid_li = "cdeghkmnrt"
        , r1_re = RegExp("^.*?([" + vowels + "][^" + vowels + "]|$)")
        , r1_spec = /^(gener|commun|arsen)/
        , doubles = /(bb|dd|ff|gg|mm|nn|pp|rr|tt)$/
        , y_cons = RegExp("([" + vowels + "])y", "g")
        , y_suff = RegExp("(.[^" + vowels + "])[yY]$")
        , exceptions1 =
        { skis: "ski"
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
        , exceptions2 = [ "inning", "outing", "canning", "herring", "earring", "proceed", "exceed", "succeed"],
        cache = {};


    return function(word) {
        var stop = except(word, exceptions1)
        if (stop) return stop

        if (word.length < 3) return word

        if (word[0] === "y") word = "Y" + word.substr(1)
        word = word.replace(y_cons, "$1Y")

        var r1, m
        if (m = r1_spec.exec(word)) {
            r1 = m[0].length
        } else {
            r1 = r1_re.exec(word)[0].length
        }

        var r2 = r1 + r1_re.exec(word.substr(r1))[0].length

        word = word.replace(/^'/, "")
        word = word.replace(/'(s'?)?$/, "")

        word = among(word,
            [ "sses", "ss"
                , "(ied|ies)", function(match, _, offset) {
                return (offset > 1) ? "i" : "ie"
            }
                , "([" + vowels + "].*?[^us])s", function(match, m1) { return m1 }
            ])

        stop = except(word, exceptions2)
        if (stop) return stop

        word = among(word,
            [ "(eed|eedly)", function(match, _, offset) {
                return (offset >= r1) ? "ee" : match + " "
            }
                , ("([" + vowels + "].*?)(ed|edly|ing|ingly)"), function(match, prefix, suffix, off) {
                if (/(?:at|bl|iz)$/.test(prefix)) {
                    return prefix + "e"
                } else if (doubles.test(prefix)) {
                    return prefix.substr(0, prefix.length - 1)
                } else if (shortv(word.substr(0, off + prefix.length)) && off + prefix.length <= r1) {
                    return prefix + "e"
                } else {
                    return prefix
                }
            }
            ])

        word = word.replace(y_suff, "$1i")

        word = among(word, r1,
            [ "(izer|ization)", "ize"
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
                , "ogi", function(m, off) {
                return (word[off - 1] === "l") ? "og" : "ogi"
            }
                , "fulli", "ful"
                , "lessli", "less"
                , "li", function(m, off) {
                return ~valid_li.indexOf(word[off - 1]) ? "" : "li"
            }
            ])

        word = among(word, r1,
            [ "ational", "ate"
                , "tional", "tion"
                , "alize", "al"
                , "(icate|iciti|ical)", "ic"
                , "(ful|ness)", ""
                , "ative", function(m, off) {
                return (off >= r2) ? "" : "ative"
            }
            ])
        word = among(word, r2,
            [ "(al|ance|ence|er|ic|able|ible|ant|ement|ment|ent|ism|ate|iti|ous|ive|ize)", ""
                , "ion", function(m, off) {
                return ~"st".indexOf(word[off - 1]) ? "" : m
            }
            ])

        word = among(word, r1,
            [ "e", function(m, off) {
                return (off >= r2 || !shortv(word, off - 2)) ? "" : "e"
            }
                , "l", function(m, off) {
                return (word[off - 1] === "l" && off >= r2) ? "" : "l"
            }
            ])

        word = word.replace(/Y/g, "y")

        return word
    }
})();

function checkInBuffer(buf, hashFunc, word) {
    var bWord = word,
        res = true,
        vLength = 7;

    if (bWord.length > vLength + 1) {
        for (var i = 0; i < bWord.length; i += vLength - 2) {
            var substring = bWord.substr(i, vLength),
                l = substring.length;

            for (var j = 0; j < vLength - l; j++) {
                substring += '0';
            }

            res = res && unpack(buf, hashFunc, substring);
        }
    } else {
        res = unpack(buf, hashFunc, bWord);
    }

    return res;
}

function unpack(buf, hashFunc, word) {
    var hash = hashFunc(word);
    return (buf[Math.floor(hash / 8)] & (0x01 << (7 - hash % 8))) != 0;
}

function ly(str) {
    var hash = new Uint32Array(1);
    for (var i = 0; i < str.length; i++) {
        hash[0] = (hash[0] * 1664525) + str.charCodeAt(i) * (i + 2) + 1013904223;
    }
    return hash[0] % 513575;//513575; 80.427
}

function prepareWord(word) {
    var bWord = word.toLowerCase(),
        i=0, pA, subs;

    for (i=0; i < pr.length; i++) {
        pA = pr[i];
        subs = bWord.substr(0, pA[0].length);

        if (pA.indexOf(subs) >= 0) {
            bWord = bWord.split(subs)[1];
            break;
        }
    }

    for (i=0; i < af.length; i++) {
        pA = af[i];
        subs = bWord.slice(-1 * pA[0].length);

        if (pA.indexOf(subs) >= 0) {
            bWord = bWord.slice(0, -1 * pA[0].length);
            break;
        }
    }

    return sp(bWord);
}

var hD,
    pr = [
        ['multi','micro','photo','under','super','inter','hyper'],
        ['over','anti','semi','fore','post','back'],
        ['non','dis','mis','pre','out','sub'],
        ['un','up']
    ],
    af = [
        ['less','like','ship'],
        ["'s"]
    ];


module.exports = {
    init: function(data) {
        hD = data;
    },
    test: function(word) {
        var bWord = prepareWord(word),
            l = bWord.length;
        return l <= 13 && l > 2 &&
            bWord.indexOf("'") < 0 &&
            !word.startsWith("'") &&
            !word.endsWith("'") &&
            checkInBuffer(hD, ly, bWord)
    }
};
