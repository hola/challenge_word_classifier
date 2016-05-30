/**
 * Created by Uzer on 04.05.2016.
 */
var fs = require('fs'),
    wordsFileName = "./words5.txt",
    destFileName = './vowelBlocks.txt',
    vowels = ["a","e","i","o","u","j","y"],
    LIMIT_FREQ_OK = 15,
    LIMIT_PERCENT_OF_OK=1.5; // 1.45

var objVowels = {"a":1, "e":1, "i":1, "o":1, "u":1, "j":1, "y":1};

fs.readFile(wordsFileName, 'utf8', function(err, data) {
    if (err) throw err;
    console.log('OK: ' + wordsFileName);

    var arWords = data.split('\n').map(function(elem) {
        return {word: elem.substr(2).toLowerCase().trim(), status:elem.substr(0,1)};
    }).filter(function(elem){return elem.word.length>0});
    console.log('arWords formed. Words:',arWords.length);

    var possibleLettersAroundVowelsOk = {}, possibleLettersAroundVowelsBad = {};

    findPossibleLettersWithFreq(arWords, possibleLettersAroundVowelsOk, possibleLettersAroundVowelsBad);
    //console.log('possible blocks around vowels found', possibleLettersAroundVowelsOk);

    // var arOk = FilterOkBlocksByFreqWithBad(possibleLettersAroundVowelsOk, possibleLettersAroundVowelsBad);
    // console.log("Ok filtered possibleLettersAroundVowels", arOk.length);

    var arBad = FilterOkBlocksByFreqWithBad(possibleLettersAroundVowelsBad, possibleLettersAroundVowelsOk);
    console.log("BAD filtered possibleLettersAroundVowels", arBad.length);

    //writeDestFile(arOk, destFileName);
    writeDestFile(arBad, "bad_vblocks.txt");
});

function FilterOkBlocksByFreqWithBad(possibleLettersAroundVowelsOk, possibleLettersAroundVowelsBad) {
    var res = [];
    for (var key in possibleLettersAroundVowelsOk) {
        if (possibleLettersAroundVowelsOk[key] < LIMIT_FREQ_OK) {
            continue;
        }
        if (possibleLettersAroundVowelsBad[key]==undefined) {
            if (key.length>1) {
                res.push({block: key, freq: possibleLettersAroundVowelsOk[key]});
                // console.log("Add! find uniq ok key", key)
            }
        } else {
            if (possibleLettersAroundVowelsOk[key] > possibleLettersAroundVowelsBad[key]*LIMIT_PERCENT_OF_OK) {
                res.push({block: key, freq: possibleLettersAroundVowelsOk[key]});
                // console.log("Add! freq ok key", key, possibleLettersAroundVowelsOk[key], "is more then bad", possibleLettersAroundVowelsBad[key]);
            } else {
                // console.log("pass. freq ok key", key, possibleLettersAroundVowelsOk[key], "is less then bad", possibleLettersAroundVowelsBad[key]);
            }
        }
    }
    return res;
}

function findPossibleLettersWithFreq(arWords, possibleLettersAroundVovelsOk, possibleLettersAroundVovelsBad) {
    function formBlockAround(chkWord, i) {
        var leftLetter1  = chkWord[i-1]==undefined ? "" : chkWord[i-1];
        var rightLetter1 = chkWord[i+1]==undefined ? "" : chkWord[i+1];
        var leftLetter2  = chkWord[i-2]==undefined ? "" : chkWord[i-2];
        var rightLetter2 = chkWord[i+2]==undefined ? "" : chkWord[i+2];
        var block = leftLetter2+leftLetter1 + chkWord[i] + rightLetter1+rightLetter2;
        return block;
    }

    arWords.forEach(function(el){
        var chkWord = el.word;
        if (chkWord.length>3 && chkWord.length<15) {
            for (var i=0; i<chkWord.length; i++) {
                if (objVowels[chkWord[i]]) {
//                if (vowels.indexOf(chkWord[i])>-1) {
                    var block = formBlockAround(chkWord,i);
                    if (el.status=="1") {
                        if (possibleLettersAroundVovelsOk[block]) {
                            possibleLettersAroundVovelsOk[block]++;
                        } else {
                            possibleLettersAroundVovelsOk[block]=1;
                        }
                    } else {
                        if (possibleLettersAroundVovelsBad[block]) {
                            possibleLettersAroundVovelsBad[block]++;
                        } else {
                            possibleLettersAroundVovelsBad[block]=1;
                        }
                    }
                }
            }
        }
    })
}

function writeDestFile(ar, fName) {
    var file = fs.createWriteStream(fName);
    file.on('error', function(err) { console.log(err) });
    ar.forEach(function(elem){
        if (elem.block.length>2) {
            file.write(elem.block+'\n');
        }
    });
    file.end();
}
