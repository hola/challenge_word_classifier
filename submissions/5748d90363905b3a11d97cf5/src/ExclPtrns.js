/**
 * Created by Uzer on 07.05.2016.
 */
var fs = require('fs'),
    sourceWordsFileName = "./words.txt",
    destFileName = './uniq_ptrns.txt';

fs.readFile(sourceWordsFileName, 'utf8', function(err, data) {
    if (err) throw err;
    console.log('OK: ' + sourceWordsFileName);

    var maxLength = 0;
    var arWords = data.split('\n').map(function(el){return el.toLowerCase()})
        .filter(function(el){return el.length>1});
    console.log('arWords formed. Words:', arWords.length);

    var uniq2LtrCombinations = findUniqComb(arWords,2);
    console.log('uniq 2-Ltr Combinations found', uniq2LtrCombinations.length);

    var uniq3LtrCombinations = findUniqComb(arWords,3);
    console.log('uniq 3-Ltr Combinations found', uniq3LtrCombinations.length);

    writeDestFile(uniq2LtrCombinations, uniq3LtrCombinations, destFileName);
});

function filterOnlyImpossible(objLtrs, len) {
    // 97 - a, 122 - z
    var res=[];
    for (var i=97; i<=122; i++) {
        for (var j=97; j<=122; j++) {
            if (len==2) {
                var combination = String.fromCharCode(i)+String.fromCharCode(j);
                if (objLtrs[combination]==undefined) {
                    res.push(combination);
                }
            } else {
                for (var k=97; k<=122; k++) {
                    var combination = String.fromCharCode(i)+String.fromCharCode(j)+String.fromCharCode(k);
                    if (objLtrs[combination]==undefined) {
                        res.push(combination);
                    }
                }
            }
        }
    }
    return res;
}

function findUniqComb(arWords, len) {
    var objLtrs={};
    arWords.forEach(function(word){
        for (var i=0; i<word.length-len; i++) {
            objLtrs [word.substr(i, len)] = 1;
        }
    });
    return filterOnlyImpossible (objLtrs, len)
}

function writeDestFile(ar2, ar3, fName) {
    var file = fs.createWriteStream(fName);
    file.on('error', function(err) { console.log(err) });
    ar2.forEach(function(el){
        file.write(el+'\n');
    });
    ar3.forEach(function(el){
        file.write(el+'\n');
    });
    file.end();
}
