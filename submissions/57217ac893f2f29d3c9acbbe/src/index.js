module.exports.test = word => {

    var p = 0,
        o = {
        1: ['e', 'a'],
        2: ['r', 't'],
        5: ['er', 'or', 'ist', 'ism', 'ian', 'ive', 'ous'],
        10: ['able', 'ible', 'less']
    }

    for(var i = 0; i < word.length; i++){
        var cc = word[i].charCodeAt(0);
        if((cc >= 65 && cc <= 90) || (cc >= 97 && cc <= 122)) {
            p += 1;
        } else {
            p += -500;
        }
    }

    console.log(p);

    for(var j in o){
        for(var h = 0; h < o[j].length; h++){
            if(word.indexOf(o[j][h]) != -1){
                p += Number(j);
            }
        }
    }

    console.log(p);

    if(word.length < 5 && p > 10) return true;
    return p > 30;

}

console.log(module.exports.test('die'));