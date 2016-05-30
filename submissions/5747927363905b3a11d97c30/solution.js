'use strict';

const fs = require('fs');
const request = require('request');

fs.readFile('./words.txt', 'utf8', (err, data) => {
    if (err) throw err;
    process(data);
});

const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', "'"];

const LONG_WORD = 17;
const SHORT_WORD = 4;

const longwords = [], shortwords = [];

const clusters = new Set();
const clusterObj = {};

function splitWord(word) {
    const words = [];
    for (let i = 0; i < word.length; ++i) {
        const oldI = i;
        let str = '';
        for (let j = 0; j < 4 && i < word.length; ++i, ++j) {
            str += word[i].toLowerCase();
            words.push(str);
        }
        i = oldI;
    }
    return words;
}


function process(data) {
    console.log(data[11]);
    const tokens = data.split('\n');
    console.log('total', tokens.length);
    let longest = tokens[0];
    const buckets = new Array(61);
    //const letters = new Set();
    buckets.fill(0);
    const theoClusters = makeClusters();
    for (let token of tokens) {
        ++buckets[token.length];
        // for (let char of token) {
        //     letters.add(char);
        // }
        for (let split of splitWord(token)) {
            clusters.add(split);
            clusterObj[split] = (clusterObj[split] || 0) + 1;
        }
        if (token.length <= SHORT_WORD) {
            shortwords.push(token);
        } else if (token.length >= LONG_WORD) {
            longwords.push(token);
        }
        if (token.length > longest.length) {
            longest = token;
            console.log(longest.length, ':', longest);
        }
    }

    const longstr = longwords.reduce((prev, cur) => prev + '\n' + cur);
    const shortstr = shortwords.reduce((prev, cur) => prev + '\n' + cur);

    fs.writeFile('./longwords.txt', longstr, 'utf8', (err) => {
        if (err) throw err;
        console.log('file written');
    });
    
    fs.writeFile('./shortwords.txt', shortstr, 'utf8', err => {
        if (err) throw err;
        console.log('file written');        
    });

    let sum = 0, size = 0;
    for (let i = buckets.length - 1; i >= 0; --i) {
        sum += buckets[i];
        size += buckets[i] * i;
        console.log(i, buckets[i], sum, size / 1024);
    }
    console.log(sum);
    // console.log(letters);
    // console.log(letters.size, 'letters total');
    console.log('theoretical', theoClusters.size);
    console.log('real', clusters.size);

    // const keys = Object.keys(clusterObj);
    // console.log(keys.length);
    // const arr = keys.map(key => ({ cluster: key, size: clusterObj[key] })).sort((a, b) => b.size - a.size)
    // console.log(arr.slice(0, 50));

    console.log(splitWord("foo"), splitWord("barrel"), splitWord("make"));
    // console.log('qjq', test('qjq'));
    // console.log('foo', test('foo'));
    // console.log('participate', test('participate'));
    testSample();
}

function makeClusters() {
    const clusters = new Set();
    const len = letters.length;
    for (let i = 0; i < len; ++i) {
        clusters.add(letters[i]);
        for (let j = 0; j < len; ++j) {
            clusters.add(letters[i] + letters[j]);
            for (let k = 0; k < len; ++k) {
                clusters.add(letters[i] + letters[j] + letters[k]);
                for (let l = 0; l < len; ++l) {
                    clusters.add(letters[i] + letters[j] + letters[k] + letters[l]);
                }
            }
        }
    }
    return clusters;
}

function simpleTest(word) {
    const splits = splitWord(word);
    return splits.every(i => clusters.has(i))
        && splits.reduce((prev, cur) => prev + (clusterObj[cur] < 20), 0) < 2
        && splits.reduce((prev, cur) => prev + (clusterObj[cur] < 30), 0) < 5
        //&& splits.reduce((prev, cur) => prev + (clusterObj[cur] < 20), 0) < 4;
        
}

function test(word, func, pow) {
    const splits = splitWord(word);
    if (!splits.every(i => clusters.has(i))) return 0;
    if (splits.reduce((prev, cur) => prev + (clusterObj[cur] < 3), 0) > 1) return 0.001;
    const foo = token => func(clusterObj[token] || 0) * Math.pow(pow, token.length) || 0;
    const bar = splits.reduce((prev, cur) => prev + foo(cur), 0) / splits.length;
    //console.log(bar);
    return bar;
}




function testSample() {
    const funcs = [i => i, i => Math.sqrt(i), i => Math.pow(0.99, i), i => Math.log(i)];
    const pows = [0.1, 0.5, 0.8, 1, 2, 3, 4, 5, 7, 10, 15, 20, 30, 40, 50, 70, 100, 150, 250, 500, 1000, 10000];
    request('https://hola.org/challenges/word_classifier/testcase', (err, res, body) => {
        if (err) throw err;
        console.log(res.statusCode);
        const sample = JSON.parse(body);
        console.log(sample);
        let sum = 0;
        for (let word of Object.keys(sample)) {
            const result = shortwords.includes(word) || simpleTest(word, funcs[0], 5);
            const match = result === sample[word];
            if (!match) {
                console.log('wrong', word, 'said', result ? 'true' : 'false');
            }
            sum += match;
        }
        console.log('percent', sum);
        // for (let func of funcs) {
        //     for (let pow of pows) {
        //         let sum = 0;
        //         const buckets = [[], []];
        //         for (let word of Object.keys(sample)) {
        //             const result = test(word, func, pow);
        //             //const bar = result > 
        //             buckets[sample[word] + 0].push({ word, result });
        //             const match = result === sample[word];
        //             if (!match) {
        //                 //console.log('wrong', word, 'said', result ? 'true' : 'false');
        //             }
        //             sum += match;
        //         }
        //         //console.log('percent', sum);
        //         buckets[0].sort((a, b) => a.result - b.result);
        //         buckets[1].sort((a, b) => a.result - b.result);
        //         //console.log(buckets);
        //         const ind = buckets[0].findIndex(i => i.result > 0);
        //         const res0 = median(buckets[0].map(i => i.result).filter(i => i > 0));
        //         const res1 = median(buckets[1].map(i => i.result));
        //         //console.log('index', ind)
        //         console.log(pow, res1 / res0);
        //         //console.log(buckets[0].reduce((prev, cur) => prev + cur.result, 0) / (buckets[0].length - ind));
        //         //console.log(buckets[1].reduce((prev, cur) => prev + cur.result, 0) / buckets[1].length);
        //     }
        //     console.log("\n");
        // }


    });
}

function median(values) {

    //values.sort( function(a,b) {return a - b;} );

    var half = Math.floor(values.length/2);

    if(values.length % 2)
        return values[half];
    else
        return (values[half-1] + values[half]) / 2.0;
}