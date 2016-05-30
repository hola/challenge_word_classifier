'use strict';
var Promise = require("bluebird");
const fs = Promise.promisifyAll(require('fs'));
const readByLine = require('./readbyline');
const extra = require('./extra');

// 19094056 / 25000000 = 76.376224% (5, 0, 0.5, 1), extra.replaceRare(s).slice(0, startSize)
// 19126719 / 25000000 = 76.506876% (5, 0, 0.5, 34), /[qjxzw]/g without heuristicys
// 19278951 / 25000000 = 77.115804%
// 77.27244% (6, 0, 0.5, 19), [qjxzwvkfbghpmd]
// 19391078 / 25000000 = 77.564312%% (6, 0, 0.5, 26), [qjxzwvkfbghpm], y -> i
// 


const [tPath, fPath] = ['true', 'false'].map(i => `./words/${i}s.txt`);

const fileSize = path => Math.round(fs.statSync(path).size / 10.24) / 100 + 'KiB';

const startSize = 6;

testSample(startSize, 0, 0.5, 11);

function hashing(startSize, endSize) {
    if (!endSize) {
        return s => extra.replaceRare(s).slice(0, startSize);
    }
    return s => {
        const a = extra.replaceRare(s);
        return a.length > startSize + endSize ? a.slice(0, startSize) + a.slice(-endSize) : a;
    };
}

const eurix = w => w.length < 16 && /^[a-z]+('s)?$/.test(w) && (w.length >= startSize || !/[eaoiu]{9,}|[^eaoiu]{9,}|[qj]$|[vhwq][xjq]/.test(w));

function makeHashSet(hash, filter, wordLimit) {
    const hashDict = new Map();
    console.time('hash dict formed');
    return readByLine(tPath, w => {
        if (w.length === 0 || !eurix(w)) return;
        const sh = hash(w);
        const o = hashDict.get(sh);
        if (o === undefined) {
            hashDict.set(sh, {t:1,f:0});
        } else {
            ++o.t;
        }
    }, wordLimit).then(() => readByLine(fPath, w => {
        if (w.length === 0 || !eurix(w)) return;
        const o = hashDict.get(hash(w));
        if (o !== undefined) {
            ++o.f;
        }
    }, wordLimit)).then(() => {
        console.timeEnd('hash dict formed');
        console.time('hash dict filtered');
        const qs = new Set();
        for (let [sh, o] of hashDict.entries()) {
            if (filter(sh, o.t, o.t + o.f)) qs.add(sh);
            // else {
            //     const p = sh.slice(0, -1);
            //     for (let c of extra.letters) {
            //         const comb = p + c;
            //         const o1 = hashDict.get(comb);
            //         if (o1 === undefined) continue;
            //         const ratio = o1.t / (o1.t + o1.f);
            //         if (o1.t > 19 && ratio > 0.9) qs.add(comb);
            //     } 
            // }
        }
        console.timeEnd('hash dict filtered');
        return qs;
    });
}

function testSample(startSize, endSize, threshold, occurences, wordLimit) {
    console.log({startSize, endSize, threshold, occurences});
    const hash = hashing(startSize, endSize);
    const filter = (sh, t, n) => (sh.length < startSize || t >= occurences) && t > n * threshold;
    makeHashSet(hash, filter, wordLimit).then(hs => {
        const harr = [...hs].sort();

        const isEnglish = w => eurix(w) && hs.has(hash(w));
        //console.log('qs formed');
        console.log('size', hs.size);
        //harr = harr.map(extra);
        //console.log(harr.slice(0, 10));
        const outData = compress(harr, startSize + endSize);
        console.log('data compressed');
        const outPath = `qs/${startSize}-${endSize}-${threshold}-${occurences}`;
        fs.writeFile(outPath, outData, 'ascii', err => {
            if (err) throw err;
            console.log('qs written');
        });
        console.time('testing dictionary');
        const s = [0, 0], t = [0, 0];
        const tp = readByLine(tPath, word => word.length > 0 && ++t[0] && isEnglish(word) && ++s[0], wordLimit);
        return readByLine(fPath, word => word.length > 0 && ++t[1] && !isEnglish(word) && ++s[1], wordLimit)
            .then(tp)
            .then(() => [s[0] + s[1], t[0] + t[1]]);
    }).then(results => {
        console.timeEnd('testing dictionary');
        const [sum, totalWords] = results;
        console.log(`${sum} / ${totalWords} = ${sum * 100/ totalWords }%`);
        //zlib.gzip(outData, {level: 9, strategy:zlib.Z_FILTERED, memLevel: 7}, (err, buf) => fs.writeFile(outPath + '.gz', buf, () => console.log('gzipped')));
    });

}


function commonSize(a, b) {
    for (var i = 0; a[i] === b[i]; ++i);
    return i;
}

const chainer = (prev, cur) => prev + cur;

function compress(arr, wordLength) {
    //arr = arr.map(el => el.split('').reverse().join('')).sort();
    const len = arr.length;
    const data = new Array(len);
    data[0] = arr[0];
    for (let i = 1; i < len; ++i) {
        const word = arr[i];
        const cs = commonSize(arr[i - 1], word);
        data[i] = `${cs < wordLength - 1 || word.startsWith(arr[i-1]) ? cs : ''}${word.slice(cs)}`;
    }
    return data.reduce(chainer);
}