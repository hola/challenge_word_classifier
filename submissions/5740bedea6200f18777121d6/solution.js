var prefs, roots, suffs;

var init = function(data) { 
    var d = data.split("|");
    prefs = d[0].split(",");
    roots = d[1].split(",");
    suffs = d[2].split(",");
}

var test = function(word) {
    var result = false;
    if (roots.indexOf(word) >= 0)
    {
        return true;
    }
    
    roots.forEach(function(x) {
        if (word.indexOf(x) >= 0) {
            var parts = word.split(x, 3);
            if (isContains(parts[0], prefs) && (isContains(parts[1], suffs)||test(parts[1]))) {
                result = true;
            }
        }
    });

    return result;
}

//check that 'word' contains parts only from 'dict'
function isContains(word, dict) {
    if (word.length == 0) {
        return true;
    }

    var old = word.length;
    var result = false;
    dict.forEach(function(x) {
        var c = word.replace(x, "");
        if (c.length < old) {
            if (isContains(c,dict)) {
                result = true;
            }
        }
    });

    return result;
}

module.exports.init = init;
module.exports.test = test;