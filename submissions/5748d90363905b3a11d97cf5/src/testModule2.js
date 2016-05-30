var vowels = ["a","e","i","o","u","j","y"],
    objVBlocks = {}, objImposBlocks = {}, obj4l = {}, objDups = {};

var init = function (data) {
    function fillObj(el, obj, n) {
        for (var i = 0; i < el.length/n; i++) {
            if (el.substr(i*n, n).length > 1) {
                obj[el.substr(i*n, n)]=1;
            }
        }
    }

    data.toString().split('\n').forEach(function (el, i) {
        if (i<3) {
            fillObj(el, objVBlocks, i+3);
        } else if (i<5) {
            fillObj(el, objImposBlocks, i-1);
        } else {
            fillObj(el, obj4l, i-2);
        }
    });
};

var test = function (word) {
    word = word.toLowerCase();
    
    var myRes = 1;

    if (isImposLtrsCombinationIn(word) || word.length<4 || word.length>25) {
        myRes = 0;
    } else {
        if (!objDups[word]) {
            objDups[word]=1;

            var isBadBlocks = false;
            for (var j=0; j<word.length; j++) {
                if (vowels.indexOf(word[j]) > -1) {
                    var block = formBlockAround(word, j);
                    if (objVBlocks[block]==1) {
                        isBadBlocks=true;
                        break;
                    }
                }
            }

            if (isBadBlocks) {
                myRes = 0;
            } else {
                if (is3v(word) || word.length>14) {
                    myRes = 0;
                }
            }
        }
    }
    return myRes==1;
}

function is3v(word) { 
    for (var i=0; i<word.length-2; i++) {
        var block = word.substr(i,3);
        if ((vowels.indexOf(block[i])>-1) && (vowels.indexOf(block[i+1])>-1) &&
            (vowels.indexOf(block[i+2])>-1)) {
            return true;
        }
        return false;
    }
}

function formBlockAround(chkWord, i) {
    var block = (chkWord[i-2]==undefined ? "" : chkWord[i-2])+
                (chkWord[i-1]==undefined ? "" : chkWord[i-1])+
                 chkWord[i]+ 
                (chkWord[i+1]==undefined ? "" : chkWord[i+1])+
                (chkWord[i+2]==undefined ? "" : chkWord[i+2]);
    return block;
}

function all3Vowel(block) { // is3nv
    if ((vowels.indexOf(block[0])>-1) && (vowels.indexOf(block[1])>-1) &&
        (vowels.indexOf(block[2])>-1)) {
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

function isImposLtrsCombinationIn (chkWord) {
    var isVowel = false, isOnlyVowels = true;
    for (var i = 0; i < chkWord.length-2; i++) {
        if (chkWord.length-i>3) {
            var block = chkWord.substr(i,4);
            if (all4Cons(block)) {
                if (!obj4l[block]) {
                    return true;
                }
            }
        }
        block = chkWord.substr(i,3);
        if (all3Vowel(block)) {
            if (!obj4l[block]){
                return true;
            }
        }
        if (objImposBlocks[chkWord.substr(i, 2)] || objImposBlocks[chkWord.substr(i, 3)]) {
            return true;
        }
        if (vowels.indexOf(chkWord[i])>-1) {
            isVowel=true;
        }
        if (vowels.indexOf(chkWord[i])==-1) {
            isOnlyVowels=false;
        }
    }
    if (!isVowel) {
        return true
    }
    if (isOnlyVowels) {
        return true
    }
    return false;
}

module.exports = {
   init: init,
   test: test
};
