var fs = require('fs'),
    vowels = ["a","e","i","o","u","j","y"];

var arVBlocks = fs.readFileSync("bad_vblocks.txt",'utf8').split('\n').filter(function(el){return el.length>0});
var objVBlocks = {};
arVBlocks.forEach(function (ptrn){
    objVBlocks[ptrn]='1';
});
console.log("read VBlocks:", Object.keys(objVBlocks).length);

var arWords = fs.readFileSync("words5.txt",'utf8').split('\n').filter(function(el){return el.length>0});
var myRes = "0";
var found=0, foundok=0;

arWords.forEach(function (el) {
    var res =  el[0];
    var word = el.substr(2);

    if (word.length>4 && word.length<15) {
        var isBadBlocks = false;
        for (var j=0; j<word.length; j++) {
            if (vowels.indexOf(word[j]) > -1) {
                var block = formBlockAround(word, j);
                if (objVBlocks[block]==1) {
                    isBadBlocks=true;
                }
            }
        }

        if (isBadBlocks) {
            myRes = "0";
            found++;
            if (myRes==res) {
                foundok++;
            }
        } else {
            myRes = "1"
        }
    }
});

console.log("found", found, foundok);

function formBlockAround(chkWord, i) {
    var leftLetter1  = chkWord[i-1]==undefined ? "" : chkWord[i-1];
    var rightLetter1 = chkWord[i+1]==undefined ? "" : chkWord[i+1];
    var leftLetter2  = chkWord[i-2]==undefined ? "" : chkWord[i-2];
    var rightLetter2 = chkWord[i+2]==undefined ? "" : chkWord[i+2];
    var block = leftLetter2+leftLetter1 + chkWord[i] + rightLetter1+rightLetter2;
    return block;
}
