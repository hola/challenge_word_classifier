
// Finalized version

var REGEXMACHINE = (function () {
    'use strict';

    console.log = function () {
    };

    var config = {};

    var rX = {};

    function _wrap(ar) {
        return '([a-z]*)(' + ar.join('|') + ')$';
    }

    function _buildRegEx(w, ar, t) {

        // ((?!(x|z|c)).i)

        if ((ar && ar.length)) {
            for (var i = 0; i < ar.length; i++) {
                if (typeof (ar[i]) !== 'string') {
                    ar[i] = _buildRegEx(ar[i].s, ar[i].x);
                }
            }
            return (t ? '(?!(' : '(?:(') + ar.join('|') + ')' + (t ? '.' : '') + w + ')';
        }

        return '';
    }

    function _buildInitPattern(o) {
        var keys = [];
        for (var k in o) {
            keys.push(k);
        }
        return _wrap(keys);
    }

    function _createPatterns(c, id) {

        rX[id] = {
            suffixes: {}
        };

        var rex = '';

        for (var i = 0; i < c.length; i++) {

            rX[id].suffixes[c[i].s] = rX[id].suffixes[c[i].s] || {};
            rX[id].suffixes[c[i].s].suffixes = rX[id].suffixes[c[i].s].suffixes || {};

            rex += '(';
            for (var z = 0; z < c[i].x.length; z++) {

                rX[id].suffixes[c[i].s].suffixes[c[i].x[z].s] = '([a-z]*)' + _buildRegEx(c[i].x[z].s, c[i].x[z].x) +
                        (c[i].x[z].not ? ('|' + _buildRegEx(c[i].x[z].s, c[i].x[z].not, true)) : '') + '$';

            }
        }

        rX[id].rex = _buildInitPattern(rX[id].suffixes);

        if (Object.keys(rX[id].suffixes).length) {
            for (var key in rX[id].suffixes) {
                if (Object.keys(rX[id].suffixes[key].suffixes).length)
                    rX[id].suffixes[key].rex = _buildInitPattern(rX[id].suffixes[key].suffixes);
            }
        }
    }

    var _initialize = function init(data) {

        // read config data made by bookworms

        config = JSON.parse(data.toString());

        for (var key in config.suffixes) {
            _createPatterns(config.suffixes[key], key);
        }
    };

    function _isAbrakadabra(str) {

        var ratio = 0.5;
        var clusters;
        var r1 = new RegExp('(?:(?![aeiou])[a-z]){3,}', 'gm');
        var r2 = new RegExp('(?:(' + config.clusters.join('|') + '))', 'g');

        if (str.match(/^[a-z]\w+/)) {
            clusters = str.match(r1);
            if (clusters) {
                for (var i = 0; i < clusters.length; i++) {
                    ratio = 0.5 * clusters[i].length;
                    clusters = clusters[i].match(r2);
                    if (!clusters) {
                        return true;
                    } else {
                        if (ratio > clusters.join('').length)
                            return true;
                    }
                }
            } else {
                return false;
            }
        } else {
            return true;
        }

        return false;
    }

    function _isGenetive(str) {

        var res = str.split(/^([a-z])*('s)$/);
        return (res && res[1]) ? true : false;

    }

    function _checkRules(str, word) {

        var scope = '', match = [];

        function _isInRuleset(str, rex) {
            match = str.match(rex);
            return match ? true : false;
        }

        str = word.isGenetiv ? str.substr(0, str.length - 2) : str;

        for (var type in word.toTest) {
            if (word.toTest[type]) {
                scope = '';
                match = word.toTest[type];


                scope = match[2];
                str = match[1];

                if (_isInRuleset(str, rX[type].suffixes[match[2]].rex)) {

                    match = match[0].match(rX[type].suffixes[scope].suffixes[match[2]]);

                    if (match && match[0].length) {
                        if (!match[1].length) {
                            console.log('all rules are passed');
                        }

                        str = match[0];
                        scope = match[2];

                    } else {
                        console.log('ruleset not passed');
                        return false
                    }

                } else {
                    console.log('not in ruleset');
                }
            }
        }
        return true;
    }

    function _soundsLike(s, r) {
        return s.match(r);
    }

    var test = function main(str) {

        if (_isAbrakadabra(str)) {
            return false;
        }

        var word = {
            isGenetive: _isGenetive(str),
            toTest: {
                adjective: _soundsLike(str, rX.adjective.rex),
                adverb: _soundsLike(str, rX.adverb.rex),
                noun: _soundsLike(str, rX.adverb.rex)
            }
        };
        console.log('--------- ' + str);
        console.log(word.toTest);
        return _checkRules(str, word);


    };

    return {
        initialize: _initialize,
        test: test
    };

})();

exports.init = REGEXMACHINE.initialize;
exports.test = REGEXMACHINE.test;