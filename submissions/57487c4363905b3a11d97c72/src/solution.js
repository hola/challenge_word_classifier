var array;
exports.init = function (data) {
    array = Array.from(data)
}
exports.test = function (word) {
    function hash(word, size) {
        var hashCode = -5;
        for (var i = 0; i < word.length; i++) {
            hashCode = hashCode * 97 % size;
            if (word[i] == "'") {
                hashCode += 28;
            }
            else if (word[i] == "{") {
                hashCode += 27;
            }
            else {
                hashCode += word.charCodeAt(i) - 96;
            }
        }
        return Math.abs(hashCode) % size;
    }

    function check(index, size, token){
        var hashCode = hash(token, size);
        var block = array[(index + hashCode) >> 3];
        return (block & (1 << hashCode % 8)) == 0;
    }

    //prefix
    if (check(0, 380000, (word + "{{{{{{").substr(0, 6))) {
        return false;
    }
    //suffix
    if (check(380000, 130000, (word + "{{{{{{{{").substr(8).split('').reverse().join(''))) {
        return false;
    }
    //vowel
    var match = word.match(/[aeoiu]{3,}/);
    if (match && check(510000, 1000, match[0])) {
        return false;
    }
    //consonate
    match = word.match(/[bcdfghjklmnpqrstvwxz]{4,}/);
    if (match && check(511000, 10000, match[0])) {
        return false;
    }
    //length
    if(word.length < 5 && check(521000, 20000, word)){
            return false;
    }
    //long
    if(word.length > 11 && check(541000, 8000, word.substr(12))){
        return false;
    }

    return (!word.match(/[bcdfghjklmnpqrstvwxyz]{6,}/))
        && (!word.match(/^.{22,}$/))
        && (!word.match(/'/) || word.match(/'[sdt]$/));
}

