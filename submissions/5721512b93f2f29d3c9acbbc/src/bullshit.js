var vovels = ['a', 'e', 'i', 'o', 'u', 'y'];
var consonants = ['b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'q', 'r', 's', 't', 'v', 'w', 'x', 'y', 'z'];
var vovelSounds = [].concat(['oo', 'ee', 'oy', 'oi', 'ou', 'ow', 'ur', 'ear', 'ay', 'eigh'], vovels);
var consonantsSounds = [].concat(['ch', 'tch', 'sh', 'sch', 'th', 'su', 'si', 'ge', 'll', 'ff', 'ph'], consonants);
var letters = [].concat(vovels, consonants);
var suffixes = ['able', 'al', 'an', 'ance', 'ancy', 'ant', 'ant', 'ar', 'ary', 'ate', 'ed', 'ee', 'en', 'en', 'ence', 'ency', 'ent', 'ent', 'er', 'er', 'es', 'es', 'est', 'fication', 'ful', 'fy', 'ify', 'ian', 'ible', 'ic', 'ing', 'ion', 'ish', 'ism', 'ist', 'ity', 'ive', 'ize', 'less', 'logy', 'ly', 'ment', 'ness', 'or', 'ous', 's', 'ship', 'sion', 'tion', 'y'];
var words4 = [];

function soundCheck(w) {
    debugger;
    var vovelReg = new RegExp('^(' + vovelSounds.join('|') + ')', 'i');
    var consonantsReg = new RegExp('^(' + consonantsSounds.join('|') + ')', 'i');
    var currentIsVovel;
    var sa, err = 0;
    if (sa = w.match(vovelReg)) {
        currentIsVovel = false;
        w = w.slice(sa[0].length);
    } else if (sa = w.match(consonantsReg)) {
        currentIsVovel = true;
        w = w.slice(sa[0].length);
    } else {
        return false;
    }
    var errCount = Math.round(w.length / 3);
    while (w.length) {
        var reg = currentIsVovel ? vovelReg : consonantsReg;
        if (sa = w.match(reg)) {
            w = w.slice(sa[0].length);
        } else {
            err++;
            if (err > errCount) {
                return false;
            }
        }
        currentIsVovel = !currentIsVovel;
    }
    return true;
}

function generateSuffixChance(iterations) {
    var r = 1, n = 0;
    while (iterations--) {
        r = r / 2;
        n += r;
    }
    return n;
}

function fourCheck(w) {
    if ((w.length !== 4) && (w.length !== 8)) {
        return false;
    }

    var sa, cw;
    while (w.length) {
        cw = w.slice(0, 4);
        w = w.slice(4);
        if (!words4.indexOf(cw)) {
            return false;
        }
    }

    return true;

    function ch(w) {
        for (var i = 0; i < words4.length; i++) {
            if (w.indexOf(words4[i]) === 0) {
                return true;
            }
        }
        return false;
    }
}

function suffixCheck(word) {
    var sa;
    if (sa = word.match(new RegExp('(' + suffixes.join('|') + ')$'))) {
        var suffix = sa[0];
        var rest = word.slice(0, word.indexOf(sa[0]));
        if (soundCheck(rest)) {
            return true;
        } else {
            if (Math.random() < generateSuffixChance(suffix.length)) {
                return true;
            } else {
                return false;
            }
        }
    }
}

function test(word) {
    // trim "'s"
    if (word.match(/\'s$/)) {
        return true;
        // word = word.slice(0, -2);
    }

    // // abbreviation
    // if (word.match(/^[A-Z]+$/)) {
    //     return true;
    // }

    if (fourCheck(word)) {
        return true;
    }

    if (suffixCheck(word)) {
        return true;
    }

    if (sa = word.match(new RegExp('(' + vovels.join('|') + ')$'))) {
        return false;
    }

    if (soundCheck(word)) {
        return Math.random() > 0.5 ? true : false;
    } else {
        return false;
    }
}

module.exports = {
    init: function(wordsBuffer) {
        if (wordsBuffer) {
            var words = wordsBuffer.toString('ascii').split('\n');
            words4 = words.filter(function(s){ return s.length === 4; });
        }
    },
    test: test
}
