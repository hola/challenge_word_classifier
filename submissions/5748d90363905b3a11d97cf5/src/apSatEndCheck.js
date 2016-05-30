var fs = require('fs');

var arWords = fs.readFileSync("words.txt",'utf8').split('\n').filter(function(el){return el.length>0});

var objApS={};

arWords.forEach(function (el) {
    var word = el.toLowerCase();
    if (word.substr(word.length-2)=="\'s") {
        var apS = word.substr(word.length-4,2);
        objApS[apS]=1;
    }
});

console.log("objApS", Object.keys(objApS).length);
var arExclApS = [];

for (var i=97; i<=122; i++) {
    for (var j=97; j<=122; j++) {
        var combination = String.fromCharCode(i)+String.fromCharCode(j);
        if (!objApS[combination]){
            arExclApS.push(combination);
        }
    }
}
console.log("arExclApS", arExclApS.length);
writeDestFile(arExclApS, "arApS.txt");

function writeDestFile(ar, fName) {
    var file = fs.createWriteStream(fName);
    file.on('error', function(err) { console.log(err) });
    ar.forEach(function(elem){
        file.write(elem+'\n');
    });
    file.end();
}
