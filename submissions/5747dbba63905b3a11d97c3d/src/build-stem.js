var fs = require('fs');
var words = fs.readFileSync('words.txt').toString().split('\n');
var stems = {};
for (var i=0; i<words.length; i++)
    stems[stem(words[i].toLowerCase())] = 1;
var lemmas = Object.keys(stems);
fs.writeFileSync("stem.txt", lemmas.join('\n'));

function stem(word){
    function shortv(word, i) {
        var vw = "aeiouy", l = word.length
        i = l<3?0:i==null?l-2:i
        return !!(~vw.indexOf(word[i]) &&
            (!~vw.indexOf(word[i - 1]) &&
             !~(vw+(i?"wxY":"")).indexOf(word[i + 1])))
    }
    function among(word, offset, replace) {
        if (!replace) return among(word, 0, offset)
        var initial = word.slice(), pattern, replacement
        for (var i = 0; i < replace.length; i+=2) {
            pattern = new RegExp(replace[i] + "$")
            replacement = replace[i + 1]
            if (typeof replacement != "string")
                word = word.replace(pattern, function(m) {
                    var off = arguments[arguments.length - 2]
                    if (off >= offset)
                        return replacement.apply(null, arguments)
                    return m
                })
            else
                word = word.replace(pattern, function(m) {
                    var off = arguments[arguments.length]
                    return off >= offset ? replacement : m+' '
                })
            if (word != initial) break
        }
        return word.replace(/ /g, "")
    }
    var r1_re = /^.*?([aeiouy][^aeiouy]|$)/, stop
    var exceptions2 = ["inning", "outing", "canning", "herring", "earring",
        "proceed", "exceed", "succeed"]
    if (word.length < 3)
        return word
    if (/^y/.test(word))
        word = "Y" + word.substr(1)
    word = word.replace(/([aeiouy])y/g, "$1Y")
    var r1, m
    if (m = /^(gener|commun|arsen)/.exec(word))
        r1 = m[0].length
    else
        r1 = r1_re.exec(word)[0].length
    var r2 = r1 + r1_re.exec(word.substr(r1))[0].length
    word = word.replace(/'(s'?)?$/, "")
    word = among(word, ["sses", "ss", "(ied|ies)", function(match, _,
        offset){ return offset > 1 ? "i" : "ie" }, "([aeiouy].*?[^us])s",
        function(match, m1) { return m1 }])
    if (~exceptions2.indexOf(word))
        return word
    word = among(word, ["(eed|eedly)", function(match, _, offset){
        return offset >= r1 ? "ee" : match + " " },
        "([aeiouy].*?)(ed|edly|ing|ingly)",
        function(match, prefix, suffix, off) {
            if (/(?:at|bl|iz)$/.test(prefix))
                return prefix + "e"
            if (/(bb|dd|ff|gg|mm|nn|pp|rr|tt)$/.test(prefix))
                return prefix.substr(0, prefix.length - 1)
            if (shortv(word.substr(0, off + prefix.length)) &&
                off + prefix.length <= r1)
                return prefix + "e"
            return prefix
        }])
    word = word.replace(/(.[^aeiouy])[yY]$/, "$1i")
    word = among(word, r1, ["(izer|ization)", "ize",
        "(ational|ation|ator)", "ate", "enci", "ence", "anci", "ance",
        "abli", "able", "entli", "ent", "tional", "tion",
        "(alism|aliti|alli)", "al", "fulness", "ful",
        "(ousli|ousness)", "ous", "(iveness|iviti)", "ive", "(biliti|bli)",
        "ble", "ogi", function(m, off){
            return word[off-1] == "l" ? "og" : "ogi" }, "fulli", "ful",
        "lessli", "less", "li", function(m, off){
            return ~"cdeghkmnrt".indexOf(word[off - 1]) ? "" : "li"}])
    word = among(word, r1, ["ational", "ate", "tional", "tion", "alize",
        "al", "(icate|iciti|ical)", "ic", "(ful|ness)", "", "ative",
        function(m, off){ return off >= r2 ? "" : "ative"}])
    word = among(word, r2, [
        "(al|ance|ence|er|ic|able|ible|ant|ement|ment|ent|ism|ate|iti|ous|ive|ize)",
        "", "ion", function(m, off){
            return ~"st".indexOf(word[off - 1]) ? "" : m }])
    word = among(word, r1, ["e", function(m, off){
        return off >= r2 || !shortv(word, off - 2) ? "" : "e" },
        "l", function(m, off){
            return word[off - 1] == "l" && off >= r2 ? "" : "l" }])
    return word.replace(/Y/g, "y")
}
