/**
 * Created by Aviram Fireberger on 06/05/2016.
 */

var saveBuffer;
const BUFFER_LENGTH = 580000;
var SUBSTRING_FIXED_SIZE = 8;
const ALL_CHARS = "abcdefghijklmnopqrstuvwxyz'"
var allSubStringLen3;
const negativeTwoOrOneCharsArr = ["'","jq","jx","jz","qj","qx","qz","vq","xj","zx","'j","'q","'x","'z","''"];

exports.init = function (buffer) {
    saveBuffer = buffer;
    InitAllSubStringLen3();
}

exports.test = function (word) {
    var sum = 1;

    //There are no 23 len words in dictionary.
    if(word.length >= 23)
    {
        return false;
    }

    //If this word contains substring in length of 2, that in this negative permutations ten this word id definitely not an "English" word.
    SUBSTRING_FIXED_SIZE = 2;
    var wordTwoOrOnePermutations = getWordSubStrings(word);
    for(var j = 0; j < wordTwoOrOnePermutations.length ;  j++) {
        var subString = wordTwoOrOnePermutations[j];
        if(negativeTwoOrOneCharsArr.indexOf(subString) > -1) {
            return false;
        }
    }


    //If this word contains substring in length of 3, that in this negative permutations ten this word id definitely not an "English" word.
    if(word.length > 2) {
        // For each substring in length 3
        var index = 0;
        while (index + 3 <= word.length) {
            var sub3 = word.substring(index, 3 + index);
            var len3BitLocation = GetSubLen3Location(sub3);
            len3BitLocation += BUFFER_LENGTH;
            index++;

            //Search the bit value in the buffer - (bigger then 0 means it should not be there)
            if (getBitValueInBuffer(len3BitLocation) > 0) {
                return false;
            }
        }
    }

    //Finding hash of 8 length or less substring in the bitmap.
    SUBSTRING_FIXED_SIZE = 8;
    var wordPermutations = getWordSubStrings(word);
    for(var j = 0; j < wordPermutations.length ;  j++)
    {
        sum = 1;
        var subString = wordPermutations[j];

        //Calculate Substring Hash
        var currentPermutation = wordPermutations[j];
        for (var i = 0, len = currentPermutation.length; i < len; i++) {
            var charValue = subString.charCodeAt(i);
            sum =  (((sum + charValue * 19)*17) % BUFFER_LENGTH);
        }

        //Search the bit value in the buffer.
        if(getBitValueInBuffer(sum) == 0)
        {
            return false;
        }
    }


    return true;
}

getBitValueInBuffer = function(location) {
    //Find Hash In Bitmap
    var indexOfByteInBuffer = Math.floor(location / 8);
    var byteValue = saveBuffer[indexOfByteInBuffer];
    var bitLocation = location % 8;
    //Shift Bit
    var bitValue = 1 << bitLocation;
    bitValue = byteValue & bitValue;
    return bitValue;
}


getWordSubStrings = function(word)
{
    if(word.length <= SUBSTRING_FIXED_SIZE)
    {
        return [word];
    }
    var array = [];
    var index = 0;
    while (index + SUBSTRING_FIXED_SIZE <= word.length)
    {
        array.push(word.substring(index, SUBSTRING_FIXED_SIZE+index));
        index++;
    }
    return array;
}

//Should save all combinations of 3 characters and their location [[aaa,1], [aab,2], [aac,3]]
InitAllSubStringLen3 = function() {
    allSubStringLen3 = [];
    var counter = 0;
    for (var i = 0; i < ALL_CHARS.length; i++) {
        for (var j = 0; j < ALL_CHARS.length; j++) {
            for (var t = 0; t < ALL_CHARS.length; t++) {
                counter++;
                var currentWord = "" + ALL_CHARS[i] + ALL_CHARS[j] + ALL_CHARS[t];
                allSubStringLen3.push([currentWord, counter]);
            }
        }
    }
}

GetSubLen3Location =function(wordLen3)
{
    for (var i = 0; i < allSubStringLen3.length; i++) {
        if(allSubStringLen3[i][0] == wordLen3)
        {
            return allSubStringLen3[i][1];
        }
    }
    return 0;
}
