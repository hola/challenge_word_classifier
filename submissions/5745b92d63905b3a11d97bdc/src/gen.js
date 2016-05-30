'use strict';

const log = console.log;

log('Please, wait 10 hours...');

const fs = require('fs');

const text = fs.readFileSync('./words.txt', 'utf-8').toLowerCase();

const lines = text.split('\n').filter(line=>line.length > 1);

Object.freeze(lines);

function getHash(str) {
    let sum = 0;
    for (let i = 0, len = str.length; i < len; i++) {
        let code = str.charCodeAt(i) - 95;
        code = code < 1 ? 1 : code;
        sum += (i <= 12 ? code * (10000 - i * 800) : code);
    }
    return sum;
}

function minify_c3(combination3) {
    const minified_c3 = {};

    for (let c3 of combination3) {
        if (!(c3[0] in minified_c3)) {
            minified_c3[c3[0]] = {};
        }
        if (!(c3[1] in minified_c3[c3[0]])) {
            minified_c3[c3[0]][c3[1]] = [];
        }
        minified_c3[c3[0]][c3[1]].push(c3[2]);
    }

    for (let c3 of combination3) {
        let arr = minified_c3[c3[0]][c3[1]];
        if (Array.isArray(arr)) {
            minified_c3[c3[0]][c3[1]] = arr.sort((a, b)=>(a <= b) ? -1 : 1).join('');
        }
    }

    return minified_c3;
}

function minify_c5(combination5) {
    const minified_c5 = {};

    for (let c5 of combination5) {
        if (!(c5[0] in minified_c5)) {
            minified_c5[c5[0]] = {};
        }
        if (!(c5[1] in minified_c5[c5[0]])) {
            minified_c5[c5[0]][c5[1]] = {};
        }
        if (!(c5[2] in minified_c5[c5[0]][c5[1]])) {
            minified_c5[c5[0]][c5[1]][c5[2]] = {};
        }
        if (!(c5[3] in minified_c5[c5[0]][c5[1]][c5[2]])) {
            minified_c5[c5[0]][c5[1]][c5[2]][c5[3]] = [];
        }
        minified_c5[c5[0]][c5[1]][c5[2]][c5[3]].push(c5[4]);
    }

    for (let c5 of combination5) {
        let arr = minified_c5[c5[0]][c5[1]][c5[2]][c5[3]];
        if (Array.isArray(arr)) {
            minified_c5[c5[0]][c5[1]][c5[2]][c5[3]] = arr.sort((a, b)=>(a <= b) ? -1 : 1).join('');
        }
    }

    return minified_c5;
}

function generateData(lines, hash_limit, c5_limit) {
    const hashes = {};

    for (let line of lines) {
        let hash = getHash(line);
        if (hash in hashes) {
            hashes[hash]++;
        } else {
            hashes[hash] = 1;
        }
    }

    const filtered_hashes = Object.keys(hashes).map(e=>+e).filter(e=>hashes[e] > hash_limit);

    var combination2 = [];

    var combination3 = [];

    for (let char1 of 'abcdefghijklmnopqrstuvwxyz\'') {
        for (let char2 of 'abcdefghijklmnopqrstuvwxyz\'') {
            let comb2 = char1 + char2;
            combination2.push(comb2);
            for (let char3 of 'abcdefghijklmnopqrstuvwxyz\'') {
                let comb3 = comb2 + char3;
                combination3.push(comb3);
            }
        }
    }

    const lines_text = lines.join();

    combination2 = combination2.filter(c2=>!lines_text.includes(c2));

    combination3 = combination3.filter(c3=>!lines_text.includes(c3) && !combination2.some(c2=>c3.includes(c2)));

    const c5_obj = {};

    for (let line of lines) {
        if (line.length < 5) {
            continue;
        }
        let c5 = line.substr(0, 5);
        if (c5 in c5_obj) {
            c5_obj[c5]++;
        } else {
            c5_obj[c5] = 1;
        }
    }

    return {
        hashes: filtered_hashes,
        c2: combination2,
        c3: minify_c3(combination3),
        c5: minify_c5(Object.keys(c5_obj).filter(e=>c5_obj[e] > c5_limit))
    }
}

function deepFreeze(obj) {
    var prop_names = Object.getOwnPropertyNames(obj);
    prop_names.forEach((name)=> {
        var prop = obj[name];
        if (typeof prop == 'object' && prop !== null && !Object.isFrozen(prop))
            deepFreeze(prop);
    });

    return Object.freeze(obj);
}

const data = generateData(lines, 9, 2);

deepFreeze(data);

const solution = require('./solution.js');

solution.init(Buffer.from(JSON.stringify(data)));

const filtered_lines = lines.filter(line=> {
    return solution.test(line);
});

Object.freeze(filtered_lines);

const filtered_data = generateData(filtered_lines, 0, 0);

const filename = './data.txt';

fs.writeFileSync(filename, JSON.stringify(filtered_data));

const zlib = require('zlib');

const gzip = zlib.createGzip({level: zlib.Z_BEST_COMPRESSION, data_type: zlib.Z_ASCII});

const inp = fs.createReadStream(filename);

const gzip_filename = './data.gz';

const out = fs.createWriteStream(gzip_filename);

inp.pipe(gzip).pipe(out).on('finish', ()=> {
    log('File ', gzip_filename, ' generated!');
    log('File size:', fs.readFileSync(gzip_filename).buffer.byteLength);
    log("Finished succesfully!");
});

