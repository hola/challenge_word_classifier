/**
 * Created by vladimir on 27.05.2016.
 */
var fs = require('fs');

var arWords = fs.readFileSync("words.txt",'utf8').split('\n').filter(function(el){return el.length>0});

var objLettersAround={};

arWords.forEach(function (el) {
    var word = el.toLowerCase();
    for (var i=0; i<word.length-1; i++) {
        if (word[i]==word[i+1]) {
            if (i>0 && i<word.length-2) {
                var block=word[i-1]+word[i]+word[i+1]+word[i+2];
                objLettersAround[block]=1;
            }
        }
    }
});

console.log("obj", Object.keys(objLettersAround));
console.log("obj", Object.keys(objLettersAround).length);
writeDestFile(Object.keys(objLettersAround), "arLtrsAroundTwins.txt");

// var arExclApS = [];
//
// for (var i=97; i<=122; i++) {
//     for (var j=97; j<=122; j++) {
//         var combination = String.fromCharCode(i)+String.fromCharCode(j);
//         if (!objApS[combination]){
//             arExclApS.push(combination);
//         }
//     }
// }
// console.log("arExclApS", arExclApS.length);
// writeDestFile(arExclApS, "arApS.txt");

function writeDestFile(ar, fName) {
    var file = fs.createWriteStream(fName);
    file.on('error', function(err) { console.log(err) });
    ar.forEach(function(elem){
        file.write(elem+'\n');
    });
    file.end();
}
