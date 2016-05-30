'use strict'
const LIMIT=6000000;
let stepsLeft = 0;
let words = {};

module.exports = {
    test: function (word)
    {
        let res = stepsLeft<LIMIT ? !!words[word] : words[word]>1;
        if (stepsLeft<LIMIT){
            stepsLeft++;
            words[word] = words[word] ? (words[word]+1) : 1;
        }
        return res;
    }
};