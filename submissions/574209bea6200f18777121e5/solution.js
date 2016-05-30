var whitelist;

var init = function (data) {
    var buff = new Buffer(data);
    whitelist = JSON.parse(buff.toString('utf-8'));
}

var test = function (word) {

    if (whitelist.indexOf(word)!==-1) {
        console.log(word + ' was on whitelist');
        return true;
    }

    if (word.length <= 4) {
        console.log(word + ' was NOT on whitelist');
        return false;
    }

    //THESE ARE DEAL BREAKERS
    rejectPatterns = [
        /q[^u]/, //q not followed by u
        /\'.*\'/, //two apostrophes
        /(.)\1\1/, //three or more isntances of any character in a row
        /x{2,}/, //double x
        /y{2,}/,
        /h{2,}/,
        /j{2,}/,
        /u{2,}/,
        /w{2,}/,
        /i{2,}/,
        /[^aeiouy\']{5}/,
        /^[^aeiouy]*$/,
        /cld/,
        /.{17,}/, //over 17 characters
        /nne$/,
        /swg/,
        /^[^eo]]{2,}/,
        /uj/,
        /fct/,
        /^ng/,
        /^\'/,
        /bl[^aeiouy]/,
        /nde$/,
        /dj/,
        /lle$/,
        /^bk/,
        /ei$/,
        /prc/,
        /j$/,
        /^ct/,
        /hz/,
        /u$/,
        /ac/,
        /^nt/,
        /x[^aeiouy]/,
        /trp/,
        /gj/,
        /jn/,
        /[aeiouy]hs$/,
        /([abcdghijkmnpruv])\1$/,
        /^([abcdfghijklmnprstuv])\1/,
        /wh[^aeioy]/,
        /[^aeiouy]ll/,
        /gsg/,
        /sv/,
        /nte$/
    ];

    suspicousThreshold = 2;
    susiciousPatterns = [
        /[^aeiou]{4}/,
        /\'/,
        /kb/,
        /cc/,
        /^x/,
        /.{17,}/, //over 17 characters
        /tz/,
        /[aeiou]{3,}/,
        /[^aeiouy]{5}/,
        /ei/,
        /^ps/
    ];

    for (var i=0; i<rejectPatterns.length; i++) {
        if (rejectPatterns[i].test(word)) {
            console.log(word + ' rejected by: ' + rejectPatterns[i]);
            return false;
        };
    }
    
    var suspiciousMatches = [];
    for (var i=0; i<susiciousPatterns.length; i++) {
        if (susiciousPatterns[i].test(word)) {
            suspiciousMatches.push(susiciousPatterns[i]);
        };
    }
    if (suspiciousMatches.length >= 2){
        console.log(word +' had too many suspicious matches: ', suspiciousMatches);
        return false;
    }


    return true;
}

exports.init = init;
exports.test = test;