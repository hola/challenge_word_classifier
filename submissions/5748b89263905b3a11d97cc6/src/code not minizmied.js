"use strict";

/**
 * init the mini dictionary
 */
var heuristicMap = {};
var x = 12;
var y = 20;
var z = 3
var l = 10;
var k = 70;

function init(dataStr) {
    
    console.log('In init function');
    var dataArr = dataStr.split('\n');
    dataArr.forEach(parseLine);
    console.log('Finished init function ');
}

/**
 * parse a line in the heuristic dictionary
 */
function parseLine(HeurDicline) {

    var arr = HeurDicline.split('\t');

    if (arr.length == 1) {
        heuristicMap[arr[0]] = {
            count: 1,
            wholeWord: 1,
            prefix: 0,
            suffix: 0
        }
    }
    else {
        heuristicMap[arr[0]] = {
            count: arr[1],
            wholeWord: arr[2],
            prefix: arr[3],
            suffix: arr[4]
        };
    }

}

var testRun = 0;
var falseFound = 0;

/**
 * test if the word exists in the mini dictionary
 */
function test(str) {
    if (testRun == 100) {
        testRun = 0;
        falseFound = 0;
    }
    testRun++;
   
    //---------All types of strings  tests------------
    //console.log('in test');
    //search if found whole word
    if (heuristicMap[str] != undefined && heuristicMap[str].wholeWord) {
        //console.log('whole word found. it is: '+str);
        return true;
    }

    //can only have one '
    var numOfApostrophe = str.split("\'").length - 1;
    if (numOfApostrophe > 1) {
        //console.log('too many apostrophes. it is: ' + str);
        falseFound++;
        return false;
    }
    //if apostrophe in form other then *'s
    if (numOfApostrophe == 1) {
        var lastTwoChars = str.substring(str.length - 2, str.length);
        if (lastTwoChars != "\'s") {
            //console.log("str not in *'s format. it is: " + str);
            falseFound++;
            return false;
        }
        else {

            //removing the 's as we dont store those in the 3 letters herutstics
            str = str.substring(0, str.length - 2);
        }
    }

    //if length is 3 or smaller it needs to be in the heuristic dictionary.
    if (str.length <= 3) {
        if (heuristicMap[str] != undefined && heuristicMap[str].wholeWord) {
            //console.log('whole word found. it is: '+str);
            return true;
        }
    }

    //remove the last if if the letter preceding it is not [saeiouy] 
    //party in plural is parties. computer is computers etc... (minimizing space)
    if (str.charAt(str.length - 1) == 's') {
        str = maybeCutS(str);
    }

    //I before E except after C
    var window;
    var exceptionsArr = [];
    var lowChanceOccurence = 0;
    for (var i = 0; i < str.length - 2; i++) {
        window = str.substr(i, 3);

        //window must be in the map
        if (heuristicMap[window] == undefined) {
            //console.log('window was not found on map. window is: '+ window +' word found. it is: ' + str);
            falseFound++;
            return false;
        }

        //muft be a prefix
        if (i == 0) {
            if (!heuristicMap[window].prefix) {
                //console.log('Must be a prefix. word found. it is: ' + str);
                falseFound++;
                return false;
            }
        }
        //must be a suffix
        if (i == str.length - 3) {
            if (!heuristicMap[window].suffix) {
                //console.log('Must be a suffix. word found. it is: ' + str);
                falseFound++;
                return false;
            }
        }

        //word store all longest words (more then 22 letters)
        if (str.length > 23) {
            //console.log('Long word not in dictionary. it is: ' + str);
            falseFound++;
            return false;
        }

        //needs to have a vowel
        if (!hasVowel(str)) {
            //console.log('No vowel found. it is: ' + str);
            falseFound++;
            return false;
        }

        //must have a constant
        if (!hasConstant(str)) {
            //console.log('No constant found. it is: ' + str);
            falseFound++;
            return false;
        }

        //for rare combination fail them   
        if (heuristicMap[window].count < x) {
            falseFound++;
            return false;
        }
        if (heuristicMap[window].count < y) {
            lowChanceOccurence++;
        }

    }//end sliding window
    
    if (lowChanceOccurence >= z && str.length >= l) {
        falseFound++;
        return false;
    }

    
    return true;
}

function maybeCutS(str) {
    var arr = ['s', 'a', 'e', 'i', 'o', 'u', 'y'];
    var beforeLast = str.charAt(str.length - 2);
    if (!inArr(arr, beforeLast)) {
        return str.substr(0, str.length - 1);
    } else {
        return str;
    }
}

function hasConstant(str) {

    var c;
    var vowels = ['a', 'e', 'i', 'o', 'u'];
    var res = false;
    for (var i = 0; i < str.length; i++) {
        c = str.charAt(i);
        if (!inArr(vowels, c)) {
            res = true;
        }

    }

    return res;
}

function inArr(arr, c) {
    for (var i = 0; i < arr.length; i++) {
        if (c == arr[i]) {
            return true;
        }
    }
    return false;
}

/**
 * has vowel
 */
function hasVowel(str) {
    var vowels = ['a', 'e', 'i', 'o', 'u', 'y'];
    var res = false;
    vowels.forEach(function (curValue) {
        if (str.indexOf(curValue) != -1) {
            res = true;
        }
    });

    return res;

}

function getEiExceptions() {
    var res = ['eight', 'weigh', 'seize', 'weird', 'vein', 'their', 'foreign', 'feisty', 'heist', 'caffeine', 'casein'];
    res = res.concat(['codeine', 'phthalein', 'protein', 'either', 'heinous', 'inveigle', 'keister']);
    res = res.concat(['leisure', 'monteith', 'neither', 'obeisance', 'seizin', 'sheikh', 'inveigh', 'neigh', 'osteitis']);

    return res;

}

/**
 * gets an ojbects and prints it,
 * the function gets an argument wheter to print the values or just the 'keys'
 */
function printObj(myObject, includeValues) {
    //by deafutl include the values as well
    if (typeof includeValues == "undefined") {
        includeValues = true

    }

    console.log('\n\This object is:');
    for (var propertyName in myObject) {
        if (includeValues) {
            console.log(propertyName + ': ' + myObject[propertyName]);
        }
        else {
            console.log(propertyName);
        }

    }
}

function setX(parm) {
    x = parm;
}
function setY(parm) {
    y = parm;
}
function setZ(parm) {
    z = parm;
}
function setL(parm) {
    l = parm;
}
function setK(parm) {
    k = parm;
}

module.exports.setX = setX;
module.exports.setY = setY;
module.exports.setZ = setZ;
module.exports.setL = setL;
module.exports.setK = setK;

module.exports.init = init;
module.exports.test = test;
module.exports.printObj = printObj;