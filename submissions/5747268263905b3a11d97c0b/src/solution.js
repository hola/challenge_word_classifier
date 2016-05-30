'use strict';
const BLOOM_SIZE = 61000;
const SMALL_WORD_OFFSET = BLOOM_SIZE + 2269*4;
const SMALL_PREFIXES_OFFSET = SMALL_WORD_OFFSET + 4395*2;
const INVALID_COMNIATIONS_OFFSET = SMALL_PREFIXES_OFFSET + 3490*2;
const END_OF_DATA_OFFSET = INVALID_COMNIATIONS_OFFSET + 188*2;
const SEED = 26297;

let bloom = new Array(BLOOM_SIZE/4);
let temlates = {};
let smallWords = {};
let smallPrefixes = {};
let invalidCombinations = {};
let steps = 0;
let goodWords = {};
let badWords = {};

function int16ToString(num){
    let ch3 = num%27;
    let ch2 = (num/27)%27;
    let str = String.fromCharCode(97+num/729);
    if (ch2!=0)
        str += String.fromCharCode(96+ch2);
    if (ch3!=0)
        str += String.fromCharCode(96+ch3);
    return str;
}

function getTemplate(word){
    let res = "";
    let consonantCount = 0;
    for (let i = 0; i<word.length; i++)
    {
        if(word[i].match(/[eyuioa]/))
        {
            if(consonantCount != 0)
                res += Math.min(consonantCount, 8);
        }
        else
            consonantCount++;
    }
    return res;
}

function getStringHash(str, seed){
    let hash = 0;
    for (let i=0; i<str.length; i++)
    {
        hash = (hash*1664525 + str.charCodeAt(i) + 1013904223 + seed)
            %0x100000000;
    }
    return hash&0x7FFFFFFF;
}

function bloomTest(str){
    let hash = getStringHash(str, SEED) % (BLOOM_SIZE*8);
    return !!((bloom[hash>>5] >> (hash%32)) & 1);
}

function test(word){
    if (word.length>15 || !word.match(/^[\w]+('s)?$/))
        return false;
    for (let k in invalidCombinations)
    {
        if (word.includes(k))
            return false;
    }
    let replaced = word.replace(/'s/, '');
    if (badWords[replaced])
        return false;
    if (replaced.length>3 && !smallPrefixes[replaced.slice(0, 3)]) 
        return false;
    let templ = getTemplate(replaced);
    if (templ && !temlates[templ])
        return false;
    if (replaced.length<4)
        return !!smallWords[replaced];
    replaced = replaced.slice(0, 7);
    return bloomTest(replaced);
}

let solution = {
    init: function(buf){
        let i, l;
        for (i=0; i<BLOOM_SIZE; i+=4)
            bloom[i/4] = buf.readInt32LE(i);
        for (l=0; i<SMALL_WORD_OFFSET; i+=4)
            temlates[l += buf.readInt32LE(i)] = true;
        for (l=0; i<SMALL_PREFIXES_OFFSET; i+=2)
        {
            l += buf.readInt16LE(i);
            smallWords[int16ToString(l)] = true;
        }
        for (l=0; i<INVALID_COMNIATIONS_OFFSET; i+=2)
        {
            l += buf.readInt16LE(i);
            smallPrefixes[int16ToString(l)] = true;
        }
        for (; i<END_OF_DATA_OFFSET; i+=2)
        {
            let str = buf.toString('utf8', i, i+2);
            invalidCombinations[str] = true;
        }
        buf.toString('utf8', END_OF_DATA_OFFSET)
        .split(' ').forEach(w=>badWords[w] = true);
    },
    test: function(word){
        let testRes = test(word);
        let res = testRes;
        if (steps>1500000 && !goodWords[word])
            res = false;
        if (steps<6000000)
        {
            steps++;
            if (testRes)
                goodWords[word]=1;
        }    
        return res;
    },
	g: function(){
		return Object.keys(goodWords).length;
	}
}

module.exports = solution;