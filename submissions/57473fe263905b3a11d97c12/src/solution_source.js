var exports = module.exports = {};
//wordforms
var wFs = [];
//short words
var ws = [];
exports.init = function(data){
    var pushToShortWords=1;
    data.toString().split("\n").forEach(function(l){
        if(l == "=")
            pushToShortWords=0;
        if(pushToShortWords == 1)
            ws.push(l);
        else wFs.push(l);
    });
}
exports.test = function(word){
    function longestRecurringCharacterSequence(word){
        return word.split('').reduce(function(max_length, char){
            var l = word.match(new RegExp(char,"gi")).length;
            return max_length < l ? l : max_length
        }, 1);
    }
    function hasRareInvalid2LetterCombination(word){
        return (null !== word.match(/aa|ii|uu|vf|vb|qm|px|qg|qy|jb|qn|cx|vw|qp|dx|qv|wq|fq|qd|ql|qh|mx|jv|qf|kx|zj|fx|jg|bx|qb|xz|xk|qo|jw|kz|kq|pq|gq|fv|vm|qw|fz|tx|vh|vp|jt|cv|qe|qr|qt|qq|yq|jh|jm|vz|pz|jc|wj|zq|bq|jj|qs|zf|jy|mq|fj|jl|jp|bz|xx|xq|vc|xr|vg|jk|xg|vt|tq|dq|cg|jd|lx|cf|cw|js|wv|xn|hq|zg|vd|xd|xv|pv|mz|mj|yj|hj|gz|zp|rx|jr|yy|gv|gj|zw|jn|lq|hz|pj|wz|zv|vk|cb|zr|zc|qi|zd|fk|fg|fp|zt|zn|cp|lj|fw|xw|kj|fd|vn|zs|qa|fh|zk|fc|xm|fb|bk|xf|kg|cd|mg|xb|wg|zm|mk|gc|cz|fm/));
    }
    function hasInvalidTwoLetterCombo(word){
        return (null !== word.match(/wx|qc|qj|cj|qx|qz|vx|jf|vq|vj|xj|qk|jx|jz|gx|hx|sx|zx|jq|vf|vb|qm|px|qg|qy|jb|qn|cx|vw|qp|dx|qv|wq|fq|qd|ql|qh|mx|jv|qf|kx|zj|fx|\'[^s|d|ve|ll]/));
    }
    function getWordForm(word){
        return word.replace(/[aeiouy]+/gi,'#');
    }
    function matchesWordForm(word){
        var result = (wFs.indexOf(getWordForm(word)) !== -1)
        return result;
    }
    /**
     * Stem the word using the Lancaster-Stemmer algorithm.
     * Credit to https://raw.githubusercontent.com/wooorm/lancaster-stemmer/master/index.js
     */
    function stem(word){
        word = word.replace("'",'');


        var STOP = -1,
            INTACT = 0,
            CONTINUE = 1,
            PROTECT = 2,
            EXPRESSION_VOWELS = /[aeiouy]/;
        var rules = {
            'a': [
                {
                    m: 'ia',
                    r: '',
                    t: INTACT
                },
                {
                    m: 'a',
                    r: '',
                    t: INTACT
                }
            ],
            'b': [
                {
                    m: 'bb',
                    r: 'b',
                    t: STOP
                }
            ],
            'c': [
                {
                    m: 'ytic',
                    r: 'ys',
                    t: STOP
                },
                {
                    m: 'ic',
                    r: '',
                    t: CONTINUE
                },
                {
                    m: 'nc',
                    r: 'nt',
                    t: CONTINUE
                }
            ],
            'd': [
                {
                    m: 'dd',
                    r: 'd',
                    t: STOP
                },
                {
                    m: 'ied',
                    r: 'y',
                    t: CONTINUE
                },
                {
                    m: 'ceed',
                    r: 'cess',
                    t: STOP
                },
                {
                    m: 'eed',
                    r: 'ee',
                    t: STOP
                },
                {
                    m: 'ed',
                    r: '',
                    t: CONTINUE
                },
                {
                    m: 'hood',
                    r: '',
                    t: CONTINUE
                }
            ],
            'e': [
                {
                    m: 'e',
                    r: '',
                    t: CONTINUE
                }
            ],
            'f': [
                {
                    m: 'lief',
                    r: 'liev',
                    t: STOP
                },
                {
                    m: 'if',
                    r: '',
                    t: CONTINUE
                }
            ],
            'g': [
                {
                    m: 'ing',
                    r: '',
                    t: CONTINUE
                },
                {
                    m: 'iag',
                    r: 'y',
                    t: STOP
                },
                {
                    m: 'ag',
                    r: '',
                    t: CONTINUE
                },
                {
                    m: 'gg',
                    r: 'g',
                    t: STOP
                }
            ],
            'h': [
                {
                    m: 'th',
                    r: '',
                    t: INTACT
                },
                {
                    m: 'guish',
                    r: 'ct',
                    t: STOP
                },
                {
                    m: 'ish',
                    r: '',
                    t: CONTINUE
                }
            ],
            'i': [
                {
                    m: 'i',
                    r: '',
                    t: INTACT
                },
                {
                    m: 'i',
                    r: 'y',
                    t: CONTINUE
                }
            ],
            'j': [
                {
                    m: 'ij',
                    r: 'id',
                    t: STOP
                },
                {
                    m: 'fuj',
                    r: 'fus',
                    t: STOP
                },
                {
                    m: 'uj',
                    r: 'ud',
                    t: STOP
                },
                {
                    m: 'oj',
                    r: 'od',
                    t: STOP
                },
                {
                    m: 'hej',
                    r: 'her',
                    t: STOP
                },
                {
                    m: 'verj',
                    r: 'vert',
                    t: STOP
                },
                {
                    m: 'misj',
                    r: 'mit',
                    t: STOP
                },
                {
                    m: 'nj',
                    r: 'nd',
                    t: STOP
                },
                {
                    m: 'j',
                    r: 's',
                    t: STOP
                }
            ],
            'l': [
                {
                    m: 'ifiabl',
                    r: '',
                    t: STOP
                },
                {
                    m: 'iabl',
                    r: 'y',
                    t: STOP
                },
                {
                    m: 'abl',
                    r: '',
                    t: CONTINUE
                },
                {
                    m: 'ibl',
                    r: '',
                    t: STOP
                },
                {
                    m: 'bil',
                    r: 'bl',
                    t: CONTINUE
                },
                {
                    m: 'cl',
                    r: 'c',
                    t: STOP
                },
                {
                    m: 'iful',
                    r: 'y',
                    t: STOP
                },
                {
                    m: 'ful',
                    r: '',
                    t: CONTINUE
                },
                {
                    m: 'ul',
                    r: '',
                    t: STOP
                },
                {
                    m: 'ial',
                    r: '',
                    t: CONTINUE
                },
                {
                    m: 'ual',
                    r: '',
                    t: CONTINUE
                },
                {
                    m: 'al',
                    r: '',
                    t: CONTINUE
                },
                {
                    m: 'll',
                    r: 'l',
                    t: STOP
                }
            ],
            'm': [
                {
                    m: 'ium',
                    r: '',
                    t: STOP
                },
                {
                    m: 'um',
                    r: '',
                    t: INTACT
                },
                {
                    m: 'ism',
                    r: '',
                    t: CONTINUE
                },
                {
                    m: 'mm',
                    r: 'm',
                    t: STOP
                }
            ],
            'n': [
                {
                    m: 'sion',
                    r: 'j',
                    t: CONTINUE
                },
                {
                    m: 'xion',
                    r: 'ct',
                    t: STOP
                },
                {
                    m: 'ion',
                    r: '',
                    t: CONTINUE
                },
                {
                    m: 'ian',
                    r: '',
                    t: CONTINUE
                },
                {
                    m: 'an',
                    r: '',
                    t: CONTINUE
                },
                {
                    m: 'een',
                    r: '',
                    t: PROTECT
                },
                {
                    m: 'en',
                    r: '',
                    t: CONTINUE
                },
                {
                    m: 'nn',
                    r: 'n',
                    t: STOP
                }
            ],
            'p': [
                {
                    m: 'ship',
                    r: '',
                    t: CONTINUE
                },
                {
                    m: 'pp',
                    r: 'p',
                    t: STOP
                }
            ],
            'r': [
                {
                    m: 'er',
                    r: '',
                    t: CONTINUE
                },
                {
                    m: 'ear',
                    r: '',
                    t: PROTECT
                },
                {
                    m: 'ar',
                    r: '',
                    t: STOP
                },
                {
                    m: 'ior',
                    r: '',
                    t: CONTINUE
                },
                {
                    m: 'or',
                    r: '',
                    t: CONTINUE
                },
                {
                    m: 'ur',
                    r: '',
                    t: CONTINUE
                },
                {
                    m: 'rr',
                    r: 'r',
                    t: STOP
                },
                {
                    m: 'tr',
                    r: 't',
                    t: CONTINUE
                },
                {
                    m: 'ier',
                    r: 'y',
                    t: CONTINUE
                }
            ],
            's': [
                {
                    m: 'ies',
                    r: 'y',
                    t: CONTINUE
                },
                {
                    m: 'sis',
                    r: 's',
                    t: STOP
                },
                {
                    m: 'is',
                    r: '',
                    t: CONTINUE
                },
                {
                    m: 'ness',
                    r: '',
                    t: CONTINUE
                },
                {
                    m: 'ss',
                    r: '',
                    t: PROTECT
                },
                {
                    m: 'ous',
                    r: '',
                    t: CONTINUE
                },
                {
                    m: 'us',
                    r: '',
                    t: INTACT
                },
                {
                    m: 's',
                    r: '',
                    t: CONTINUE
                },
                {
                    m: 's',
                    r: '',
                    t: STOP
                }
            ],
            't': [
                {
                    m: 'plicat',
                    r: 'ply',
                    t: STOP
                },
                {
                    m: 'at',
                    r: '',
                    t: CONTINUE
                },
                {
                    m: 'ment',
                    r: '',
                    t: CONTINUE
                },
                {
                    m: 'ent',
                    r: '',
                    t: CONTINUE
                },
                {
                    m: 'ant',
                    r: '',
                    t: CONTINUE
                },
                {
                    m: 'ript',
                    r: 'rib',
                    t: STOP
                },
                {
                    m: 'orpt',
                    r: 'orb',
                    t: STOP
                },
                {
                    m: 'duct',
                    r: 'duc',
                    t: STOP
                },
                {
                    m: 'sumpt',
                    r: 'sum',
                    t: STOP
                },
                {
                    m: 'cept',
                    r: 'ceiv',
                    t: STOP
                },
                {
                    m: 'olut',
                    r: 'olv',
                    t: STOP
                },
                {
                    m: 'sist',
                    r: '',
                    t: PROTECT
                },
                {
                    m: 'ist',
                    r: '',
                    t: CONTINUE
                },
                {
                    m: 'tt',
                    r: 't',
                    t: STOP
                }
            ],
            'u': [
                {
                    m: 'iqu',
                    r: '',
                    t: STOP
                },
                {
                    m: 'ogu',
                    r: 'og',
                    t: STOP
                }
            ],
            'v': [
                {
                    m: 'siv',
                    r: 'j',
                    t: CONTINUE
                },
                {
                    m: 'eiv',
                    r: '',
                    t: PROTECT
                },
                {
                    m: 'iv',
                    r: '',
                    t: CONTINUE
                }
            ],
            'y': [
                {
                    m: 'bly',
                    r: 'bl',
                    t: CONTINUE
                },
                {
                    m: 'ily',
                    r: 'y',
                    t: CONTINUE
                },
                {
                    m: 'ply',
                    r: '',
                    t: PROTECT
                },
                {
                    m: 'ly',
                    r: '',
                    t: CONTINUE
                },
                {
                    m: 'ogy',
                    r: 'og',
                    t: STOP
                },
                {
                    m: 'phy',
                    r: 'ph',
                    t: STOP
                },
                {
                    m: 'omy',
                    r: 'om',
                    t: STOP
                },
                {
                    m: 'opy',
                    r: 'op',
                    t: STOP
                },
                {
                    m: 'ity',
                    r: '',
                    t: CONTINUE
                },
                {
                    m: 'ety',
                    r: '',
                    t: CONTINUE
                },
                {
                    m: 'lty',
                    r: 'l',
                    t: STOP
                },
                {
                    m: 'istry',
                    r: '',
                    t: STOP
                },
                {
                    m: 'ary',
                    r: '',
                    t: CONTINUE
                },
                {
                    m: 'ory',
                    r: '',
                    t: CONTINUE
                },
                {
                    m: 'ify',
                    r: '',
                    t: STOP
                },
                {
                    m: 'ncy',
                    r: 'nt',
                    t: CONTINUE
                },
                {
                    m: 'acy',
                    r: '',
                    t: CONTINUE
                }
            ],
            'z': [
                {
                    m: 'iz',
                    r: '',
                    t: CONTINUE
                },
                {
                    m: 'yz',
                    r: 'ys',
                    t: STOP
                }
            ]
        };
        function isAcceptable(value) {
            return EXPRESSION_VOWELS.test(value.charAt(0)) ?
                value.length > 1 :
                value.length > 2 && EXPRESSION_VOWELS.test(value);
        }
        function applyRules(value, isIntact) {
            var breakpoint;

            var ruleset = rules[value.charAt(value.length - 1)];

            if (!ruleset) {
                return value;
            }

            var index = -1;
            var length = ruleset.length;

            while (++index < length) {
                var rule = ruleset[index];

                if (!isIntact && rule.t === INTACT) {
                    continue;
                }

                breakpoint = value.length - rule.m.length;

                if (
                    breakpoint < 0 ||
                    value.substr(breakpoint) !== rule.m
                ) {
                    continue;
                }

                if (rule.t === PROTECT) {
                    return value;
                }

                var next = value.substr(0, breakpoint) + rule.r;

                if (!isAcceptable(next)) {
                    continue;
                }

                if (rule.t === CONTINUE) {
                    return applyRules(next, false);
                }
                return next;
            }
            return value;
        }
        function stem(value) {
            return applyRules(String(value).toLowerCase(), true);
        }
        var affixes = 'after|agro|ambi|ante|anti|anti|arch|asm|auto|back|bio|contra|counter|de|demi|down|eco|em|en|ex|extra|fore|folk|fulness|geo|gist|hemi|hetero|hind|homo|ill|infra|inter|intra|iso|ist|less|lessness|logy|mal|ment|meta|meter|methyl|metric|micro|mid|mini|neo|ness|nesses|non|off|omni|on|out|over|pan|para|penta|phono|photo|post|pre|pre|pro|re|retro|self|semi|step|sub|super|tele|therapy|thermo|trans|trans|tress|tri|ultra|under|un|uni|with';
        var prefixes = new RegExp('^(' + affixes + ')', "g");
        var suffixes = new RegExp('(' + affixes + ')$', "g");
        //don't replace if ratio is wrong
        var preWord = word.replace(prefixes, "");
        if( preWord.length < 4 )
            preWord = word;
        var afterWord = preWord.replace(suffixes, "");
        if( afterWord.length < 4 )
            afterWord = preWord;

        var stemmed = stem(afterWord);
        return stemmed;
    }
    function isValid(word){
        //if the word has more than 2 characters after the '
        if( word.match(new RegExp("\'[a-zA-Z]{2}.+") ) )
            return false;
        //replace any 's
        word = word.replace(/['.*]/,'');
        if( !word.length) return false;
        if( word.length == 1) return true;
        //we have stored all word lengths < 4
        if( word.length <= 4 )
            return ws.indexOf(word) !== -1;
        var stemmedWord = stem(word);
        if(matchesWordForm(stemmedWord)||matchesWordForm(word))
            return true;
        if(ws.indexOf(stemmedWord) !== -1)
            return true;
        if( hasInvalidTwoLetterCombo(word))
            return false;
        if(hasRareInvalid2LetterCombination(word))
            return false;
        if(longestRecurringCharacterSequence(word) > 3)
            return false;
        if( stemmedWord.length >= 12 || stemmedWord.length <= 4 )
            return false;
        return true;
    }
    return isValid(word);
}
