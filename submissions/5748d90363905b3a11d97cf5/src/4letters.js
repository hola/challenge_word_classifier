var fs = require('fs');
var vowels = ["a","e","i","o","u","j","y"];

var arWords = fs.readFileSync("words.txt",'utf8').split('\n').filter(function(el){return el.length>0});

var obj4l={};

arWords.forEach(function (el) {
    var word = el.toLowerCase();
    for (var i = 0; i<word.length-3; i++) {
        var block = word.substr(i,4);
        if (all4Cons(block)) {
            obj4l[block]=1;
            // break;
        }
        block = word.substr(i,3);
        if (all3Vowel(block)) {
            obj4l[block]=1;
            // break;
        }
    }
});

console.log("ar4l", Object.keys(obj4l).length);
writeDestFile(Object.keys(obj4l), "ar4l.txt");

function all3Vowel(block) { // is3nv
    if ((vowels.indexOf(block[0])>-1) && (vowels.indexOf(block[1])>-1) &&
        (vowels.indexOf(block[2])>-1)) {
        return true;
    }
    return false;
}
function all4Vowel(block) { // is3nv
    if ((vowels.indexOf(block[0])>-1) && (vowels.indexOf(block[1])>-1) &&
        (vowels.indexOf(block[2])>-1) && (vowels.indexOf(block[3])>-1)) {
        return true;
    }
    return false;
}
function all4Cons(block) { // is3nv
    if ((vowels.indexOf(block[0])==-1) && (vowels.indexOf(block[1])==-1) &&
        (vowels.indexOf(block[2])==-1) && (vowels.indexOf(block[3])==-1)) {
        return true;
    }
    return false;
}

function is4v(word) { // is3nv
    for (var i=0; i<word.length-2; i++) {
        var block = word.substr(i,3);
        if ((vowels.indexOf(block[i])>-1) && (vowels.indexOf(block[i+1])>-1) &&
            (vowels.indexOf(block[i+2])>-1)) {
            return true;
        }
        return false;
    }
}

function writeDestFile(ar, fName) {
    var file = fs.createWriteStream(fName);
    file.on('error', function(err) { console.log(err) });
    ar.forEach(function(elem){
        file.write(elem+'\n');
    });
    file.end();
}
