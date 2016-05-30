'use strict';
const fs = require('fs');
const BLOOM_SIZE = 61000;
const HASH_SEED = 26297;

function getInvalidCombinations(words){
    let combinations = {};
    let invalidCombinations = new Set();
    for (let word of words)
    {
        if (word.length>15)
            continue;
        for (let i=0; i < word.length-1; i++)
        {
            let comb = word.substr(i,2);
            if (!combinations[comb])
                combinations[comb] = 0;
            combinations[comb]++;
        }
    }
    for (let comb in combinations)
    {
        if (combinations[comb] < 120)
            invalidCombinations.add(comb);
    }
    for (let i=97; i<123; i++)
    {
        for (let j=97; j<123; j++)
        {
            let comb = String.fromCharCode(i) + String.fromCharCode(j);
            if (!combinations[comb])
                invalidCombinations.add(comb);
        }
    }
    return invalidCombinations;
}

function getPrefixes(words){
    let prefixCounters = {};
    for (let word of words)
    {
        if (word.length<4)
            continue;
        let prefix = word.substr(0,3);
        if (!prefixCounters[prefix])
            prefixCounters[prefix] = 0;
        prefixCounters[prefix]++;
    }
    let prefixes = new Set();
    for (let prefix in prefixCounters)
    {
        if(prefixCounters[prefix] > 3)
            prefixes.add(prefix);
    }
    return prefixes;
}

function filterWords2(words, prefixes){
    let result = new Set();
    for (let word of words)
    {
        if (word.length<4 || prefixes.has(word.substr(0,3))) 
            result.add(word);
    }
    return result;
}

function getTemplate(word){
    let res = "";
    let consonantCount = 0;
    for (let i=0; i<word.length; i++)
    {
        let ch = word[i];
        if (ch.match(/[eyuioa]/))
        {
            if (consonantCount!=0)
                res += Math.min(consonantCount, 8);
        }
        else
            consonantCount++;
    }
    return res;
}

function getTemplates(filteredWords, allWords){
    let templatesCounters = {};
    for (let word of filteredWords)
    {
        let templ = getTemplate(word);
        if (!templatesCounters[templ])
            templatesCounters[templ] = 0;
        templatesCounters[templ]++;
        if (allWords.has(word+"'s"))
            templatesCounters[templ]++;
    }
    let templates = new Set();
    for (let templ in templatesCounters)
    {
        if (templatesCounters[templ] > 1)
            templates.add(templ);
    }
    return templates;
}

function getSmallWordsAndBigPrefixes(words, templates, allWords){
    let smallWords = new Set();
    let bigPrefixesCounters = {};
    for (let word of words)
    {
        let template = getTemplate(word);
        if (!templates.has(template))
            continue;
        if (word.length<4)
            smallWords.add(word);
        else
        {
            let prefix = word.slice(0, 7);
            if (!bigPrefixesCounters[prefix])
                bigPrefixesCounters[prefix] = 0;
            bigPrefixesCounters[prefix]++;
            if (word.length<13)
                bigPrefixesCounters[prefix]++;    
        }
    }
    let bigPrefixes = new Set();
    for(let prefix in bigPrefixesCounters){
        if (bigPrefixesCounters[prefix] > 1)
            bigPrefixes.add(prefix);
    }
    return {smallWords, bigPrefixes};
}

function getStringHash(str, seed){
    let hash = 0;
    for (let i=0; i<str.length; i++)
        hash = ((hash*1664525)+str.charCodeAt(i)+1013904223+seed)%0x100000000;
    return hash&0x7FFFFFFF;
}

function getBigPrefixesBuffer(prefixes){
    let bloomData = new Array(BLOOM_SIZE/4);
    for (let prefix of prefixes)
    {
        let index = getStringHash(prefix, HASH_SEED) % (BLOOM_SIZE*8);
        bloomData[index>>5] |= 1<<(index%32);
    }
    let buf = Buffer.alloc(BLOOM_SIZE);
    for (var i=0; i<BLOOM_SIZE; i+=4)
        buf.writeInt32LE(bloomData[i/4], i);
    return buf;
}

function getTemplatesBuffer(templates){
    templates.delete('');
    let templateArr = Array.from(templates).map(t=>+t).sort((a,b)=>a-b);
    let lastI = 0;
    for (let i=0; i<templateArr.length; i++)
    {
        templateArr[i] -= lastI;
        lastI += templateArr[i];
    }
    let buf = Buffer.alloc(templateArr.length*4);
    for (let i=0; i<templateArr.length; i++)
        buf.writeInt32LE(templateArr[i], i*4);
    return buf;
}

function stringToInt16(str){
    let wordI = (str.charCodeAt(0)-97)*729;
    if (str.length>1)
        wordI += (str.charCodeAt(1)-96)*27;
    if (str.length>2)
        wordI += str.charCodeAt(2)-96;
    return wordI;
}

function getStringsBuffer(strings){
    let arr = Array.from(strings).map(w=>stringToInt16(w)).sort((a,b)=>a-b);
    let lastI = 0;
    for (let i=0; i<arr.length; i++)
    {
        arr[i] -= lastI;
        lastI += arr[i];
    }
    let buf = Buffer.alloc(arr.length * 2);
    for (let i=0; i<arr.length; i++)
        buf.writeInt16LE(arr[i], i*2);
    return buf;
}

function filterWords1(words, invalidCombinations){
    let filteredWords = new Set();
    for (let word of words)
    {
        if(word.length>15)
            continue;
        let isGood = true;
        for (let comb of invalidCombinations)
        {
            if (word.includes(comb))
            {
                isGood = false;
                break;
            }
        }
        if(!isGood)
            continue;
        filteredWords.add(word);
    }
    return filteredWords;
}

function main(path = '.'){
    if (!fs.existsSync('./words.txt'))
    {
        console.log("Cann't find file ./words.txt");
        return 1;
    }
	if (!fs.existsSync('./badwords.txt'))
    {
        console.log("Cann't find file ./badwords.txt");
        return 1;
    }
    let data = fs.readFileSync('./words.txt', 'utf8');
    let allWords = new Set(data.split(/\r?\n/)
        .filter(w=>w.match(/^[\w]+('s)?$/))
        .map(w=>w.toLowerCase()));    
    let filteredWords = new Set();
    allWords.forEach(w=>filteredWords.add(w.replace(/'s/,'')));    
    let invalidCombinations = getInvalidCombinations(filteredWords);
    filteredWords = filterWords1(filteredWords, invalidCombinations);            
    let prefixes = getPrefixes(filteredWords);
    filteredWords = filterWords2(filteredWords, prefixes);    
    let templates = getTemplates(filteredWords, allWords);
    let {smallWords, bigPrefixes} = 
        getSmallWordsAndBigPrefixes(filteredWords,templates, allWords);
    let buf = Buffer.concat([
        getBigPrefixesBuffer(bigPrefixes),
        getTemplatesBuffer(templates),
        getStringsBuffer(smallWords),
        getStringsBuffer(prefixes),
        new Buffer(Array.from(invalidCombinations).sort().join('')),
        fs.readFileSync('./badwords.txt'),
    ]);        
    fs.writeFileSync('data', buf);
}

process.exit(main()|| 0);