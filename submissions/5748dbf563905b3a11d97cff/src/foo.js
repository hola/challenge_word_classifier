'use strict';
const readByLine = require('./readbyline');
const extra = require('./extra');
const util = require('./util');
const fs = util.fs;

// 19094056 / 25000000 = 76.376224% (5, 0, 0.5, 1), extra.replaceRare(s).slice(0, startSize)
// 19126719 / 25000000 = 76.506876% (5, 0, 0.5, 34), /[qjxzw]/g without heuristicys
// 19278951 / 25000000 = 77.115804%
//                       77.27244%  (6, 0, 0.5, 19), [qjxzwvkfbghpmd]
// 19391078 / 25000000 = 77.564312% (6, 0, 0.5, 26), [qjxzwvkfbghpm], y -> i
// 19420952 / 25000000 = 77.683808% (6, 0, 0.5, 12), [qjxzwvkfbgh], y -> i, au -> o
// 19446774 / 25000000 = 77.787096% (6, 0, 0.5, 26), [qjxzwvkfbg], y -> i, au -> o

// node holatest ./solution ./test_dir

// sudo 7z a -mx=9 solution/data.gz qs/data

const [tPath, fPath] = ['true', 'false'].map(i => `./words/${i}s.txt`);

const startSize = 6;

testSample(startSize, 0, 0.5, 25);

function hashing(startSize, endSize) {
    if (!endSize) {
        return s => extra.replaceRare(s).slice(0, startSize);
    }
    return s => {
        const a = extra.replaceRare(s);
        return a.length > startSize + endSize ? a.slice(0, startSize) + a.slice(-endSize) : a;
    };
}

const eurix = w => w.length < 16 && /^[^x'][a-z]*('s)?$/.test(w) && (w.length >= startSize || !/[eaoiu]{9,}|[^eaoiu]{9,}|[qj]$|q.$|q[^u]|[^i]c$|[vhwq][xjq]/.test(w));

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
        const outData = util.compress(harr, startSize + endSize);
        console.log('data compressed');
        const gzPath = `arch/${startSize}-${endSize}-${threshold}-${occurences}.gz`;
        util.writeGzipped(gzPath, outData)
            .catch(err => { throw err; })
            .then(so => console.log('archived:', util.fileSize(gzPath)));
        
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


