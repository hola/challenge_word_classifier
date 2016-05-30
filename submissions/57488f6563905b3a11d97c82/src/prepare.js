var fs = require('fs');
var zlib = require('zlib');
var _ = require('lodash');
var bloomfilter = require('bloomfilter');
var uglify = require('uglify-js2');

const FILE_SOLUTION = 'solution/solution.js';
const FILE_SOURCE = 'data/source.js';
const FILE_WORDS = 'data/words.txt';
const FILE_DATA_GZ = 'solution/data.gz';

const LN2_SQARED = Math.LN2 * Math.LN2;

const NGRAMM_LENGTH = 7;

const FPR_INIT = 0.73;
const FPR_STEP = 0.0001;

const MIN_HASH_COUNT = 1;

const TARGET_FILE_SIZE = 65536 - fs.statSync(FILE_SOLUTION).size;

//

console.info(`Target file size is ${TARGET_FILE_SIZE} byte(s)`);

let words = readWords(FILE_WORDS);
console.info(`${words.length} unique word(s) read`);

let nGramms = getNGramms(words, NGRAMM_LENGTH);
console.info(`${nGramms.length} N-gramm(s) extracted`)

let data = {
    l: null, // Length of each N-gramm
    h: null, // Hash count
    d: null, // Filter data
    s: null  // Compressed source
};

let ugly = uglify.minify(FILE_SOURCE);

data.s = ugly.code;
data.l = NGRAMM_LENGTH;

let packed = null;

for (let FPR = FPR_INIT; FPR <= 1 && (packed ? packed.length > TARGET_FILE_SIZE : true); FPR += FPR_STEP) {
    let estimated = Math.round(-1 * nGramms.length * Math.log(FPR) / LN2_SQARED);
    let hashCount = Math.round((estimated / nGramms.length) * Math.LN2);
    hashCount = hashCount < MIN_HASH_COUNT ? MIN_HASH_COUNT : hashCount;

    let bloom = new bloomfilter.BloomFilter(estimated, hashCount);
    nGramms.forEach((w) => bloom.add(w));

    data.d = [].slice.call(bloom.buckets);
    data.h = hashCount;

    packed = zlib.gzipSync(new Buffer(JSON.stringify(data)), { level: 9 });
    console.info(`FPR ${Math.round(FPR * 100)}% Estimated ${estimated} byte(s) / ${hashCount} hash(es) - ${packed.length} byte(s) total`);

}

fs.writeFileSync(FILE_DATA_GZ, packed);


//

function readWords(fileName) {
    return _.uniq(
        fs.readFileSync(fileName).toString()
            .toLowerCase()
            .split('\n')
    );
}

function getNGramms(words, nGrammLength) {
    let list = {};
    words.forEach(function(word) {
        getNGrammsFromWord(word, nGrammLength).forEach(function(nGramm) {
            list[nGramm] = true;
        });
    });
    return _.keys(list);
}

function getNGrammsFromWord(word, nGrammLength) {
    let nGramms = [];
    for (let from = 0, to = word.length - nGrammLength; from <= to; ++from) {
        nGramms.push(word.substr(from, nGrammLength));
    }
    return nGramms;
}

// let data = {};

// data.ngramm_length = NGRAMM_LENGTH;

// let words_all = utils.readWords(FILE_WORDS);
// let words_unique = _.uniq(words_all);

// console.info(`${words_unique.length} unique word(s) from ${words_all.length}`);

// let allowed_trigramms = {};
// words_unique.forEach(function(word) {
//     utils.getNGramms(word, NGRAMM_LENGTH).forEach((trigramm) => !allowed_trigramms[trigramm] && (allowed_trigramms[trigramm] = true));
// });
// allowed_trigramms = _.sortedUniq(_.sortBy(_.keys(allowed_trigramms)));

// console.info(`${allowed_trigramms.length} allowed trigramm(s) found; ${all_trigramms.length} total`);

// if (allowed_trigramms.length < (all_trigramms.length - allowed_trigramms.length)) {
// data.trigramms = allowed_trigramms;
// data.trigramms_are_allowed = true;
// console.info('List of allowed trigramms is smaller than forbidden');
// } else {
//     data.trigramms = _.difference(all_trigramms, allowed_trigramms);
//     data.trigramms_are_allowed = false;
//     console.info(`List of forbidden trigramms is smaller than allowed (${data.trigramms.length})`);
// }

// _.remove(words, (w) => w.length < 2 && w.length > 21);
// console.info(`Will put ${allowed_trigramms.length} word(s) into filter`);

// let packed = null;

// for (let false_positive_rate = FPR_INIT; false_positive_rate <= 1 && (packed ? packed.length > TARGET_FILE_SIZE : true); false_positive_rate += FPR_STEP) {
//     let estimated_size = Math.round(-1 * allowed_trigramms.length * Math.log(false_positive_rate) / LN2_SQARED);
//     let hash_count = Math.round((estimated_size / allowed_trigramms.length) * Math.LN2);
//     hash_count = hash_count < MIN_HASH_COUNT ? MIN_HASH_COUNT : hash_count;

//     let bloom = new bloomfilter.BloomFilter(estimated_size, hash_count);
//     allowed_trigramms.forEach((w) => bloom.add(w));

//     data.bloom = [].slice.call(bloom.buckets);
//     data.hash_count = hash_count;

//     packed = zlib.gzipSync(new Buffer(JSON.stringify(data)), { level: 9 });
//     console.info(`FPR ${Math.round(false_positive_rate * 100)}% Estimated ${estimated_size} byte(s) / ${hash_count} hash(es) - ${packed.length} byte(s) total`);

// }

// fs.writeFileSync(FILE_DATA_GZ, packed);
// fs.writeFileSync(FILE_DATA, data);