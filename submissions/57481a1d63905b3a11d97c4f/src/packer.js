const PACK = true;

const fs = require('fs');
const childProcess = require('child_process');
const Trie = require('./lib/trie');

// TODO virtual word detector

const file = fs.readFileSync('words.txt', 'utf-8');
const lines = file.split('\n');
const count = lines.length - 1;

let {affixes, prefixesCount} = require('./lib/affixes');

console.log(`Affixes count: ${affixes.length}`);
if (affixes.length > 127) {
    console.error('Too many affixes');
    return;
}
// {par: parent, aff: set off affixes that can be applied to this word}
let trie = new Trie();
for (let i = 0; i < count; ++i) {
    const line = lines[i].toLowerCase();
    trie.addWord(line, {par: null, parAff: null, aff: new Set()});
}

/**
 * @param {string} parent
 * @param {string} word
 * @param {Array<Array<int>>} affixIndices
 * @returns {boolean}
 */
let updateWord = function (parent, word, affixIndices) {
    let updated = false;
    if (trie.find(word)) {
        trie.updateData(parent, ({par, parAff, aff}) => {
            affixIndices.forEach((index) => {
                aff.add(index);
            });
            if (par) {
                const addToParent = affixIndices.map((i) => [parAff, ...i]);
                updateWord(par, parent, addToParent);
            }

            return {par, parAff, aff}
        });

        trie.updateData(word, ({par, parAff, aff}) => {
            if (!par) {
                par = parent;
                parAff = affixIndices[0][0];
                updated = true;
            }
            return {par, parAff, aff};
        });
    }
    return updated;
};

let process = function () {
    let c = 0;
    let updated = false;

    trie.walk('', (word, {par, parAff, aff}) => {
        ++c;
        affixes.forEach((affix, i) => {
            let n;
            affix.forEach((v) => {
                v = v.split('|');
                let isPrefix = v[2][0] == '^';
                let r = new RegExp(isPrefix ? v[2] : `${v[2]}$`);

                if (r.test(word)) {
                    if (isPrefix) {
                        n = v[1] + word.substr(v[0].length);
                    } else {
                        n = word.substr(0, word.length - v[0].length) + v[1];
                    }

                    const res = updateWord(word, n, [[i]]);
                    updated = updated || res;
                }
            });
        });

        if (c % 1024 == 0) {
            console.log(c);
        }

    });

    if (!updated) {
        return;
    }

    process();
};

process();

const addToAffixesList = function (affixesList, item) {
    let itemS = [];
    item.forEach((i) => {
        if (i < prefixesCount) {
            itemS.push(i);
        }
    });
    item.forEach((i) => {
        if (i >= prefixesCount) {
            itemS.push(i);
        }
    });
    if (!affixesList.find((it) => {
        if (it.length == itemS.length) {
            for (let i = 0; i < it.length; ++i) {
                if (it[i] != itemS[i]) {
                    return false
                }
            }
            return true;
        }
        return false;
    })) {
        affixesList.push(itemS);
    }
};

const generateSolution = (pack, minAffixesCount = 0, maxWordLength = 0) => {
    if (pack) {
        console.log(`Try ${minAffixesCount}-${maxWordLength}...`);
    }

    const out = new Trie();
    let totalCount = 0;
    // Calculate affix frequencies
    let freqs = [];
    for (let i = 0; i < affixes.length; ++i) {
        freqs.push({
            id: i,
            count: 0
        });
    }

    const newWords = [];
    trie.walk('', (word, {par, aff}) => {
        if (!par) {
            if (aff.size > 0) {
                let newAff = new Set();
                let a = [];
                [...aff].forEach((i) => {
                    i.forEach((j) => {
                        newAff.add(j);
                        freqs[j].count++;
                    });
                    addToAffixesList(a, i);
                });
                a = a.map((r) => r.join('>'));
                if (!pack) {
                    newWords.push(`${word}/${a.join(',')}`);
                }
                if (!pack || (a.length > minAffixesCount && word.length <= maxWordLength)) {
                    out.addWord(word, {par, aff: newAff});
                    totalCount += 1 + a.length;
                }
            } else if (!pack) {
                newWords.push(word);
                out.addWord(word, {par, aff});
                totalCount++;
            }
        }
    });

    if (!pack) {
        console.log(`Dictionary: ${newWords.length}`);
        fs.writeFileSync('new_words.txt', newWords.join('\n'));
    }

    freqs.sort((a, b) => {
        if (a.count > b.count) return -1;
        else if (a.count < b.count) return 1;
        return 0;
    });

    let affMap = new Map();
    freqs.forEach((item, i) => {
        affMap.set(item.id, i);
    });

    let out2 = new Trie();

    out.walk('', (word, {par, aff}) => {
        let newAff = new Set();
        for (let v of aff.values()) {
            newAff.add(affMap.get(v));
        }
        out2.addWord(word, {par, aff: newAff});
    });
    let sortedAffixes = [];
    freqs.forEach(({id, count}) => {
        if (count) {
            sortedAffixes.push(affixes[id])
        }
    });
    console.log(`${minAffixesCount}-${maxWordLength} forms: ${totalCount}`);

    let fileExt = `.${minAffixesCount}-${maxWordLength}`;
    const fd = fs.openSync(`variants/pack${fileExt}`, 'w+');
    out2.write(fd);
    fs.closeSync(fd);

    let solution = `let affixes=${JSON.stringify(sortedAffixes)};`;
    ['lib/trie.js', 'lib/find.js',
        'solution.js'].forEach((f) => {
        let file = fs.readFileSync(f, 'utf8');
        file = file.replace(/\s*\/\/STRIP[\S\s]*?\/\/SEND\s*/g, '');
        solution += file;
    });
    fs.writeFileSync(`variants/data${fileExt}`, solution, 'utf8');

    const stats = fs.statSync(`variants/data${fileExt}`);
    fs.writeFileSync(`variants/solution${fileExt}.js`,
        `var t,i
module.exports={init(b){eval(b.slice(0,${stats.size}).toString())
i(b.slice(${stats.size}))},test(w){return t(w)}}`);

    const stats2 = fs.statSync(`variants/solution${fileExt}.js`);

    childProcess.execSync(`cat variants/pack${fileExt} >> variants/data${fileExt}`);
    childProcess.execSync(`zopfli -i10000 variants/data${fileExt}`);

    const stats3 = fs.statSync(`variants/data${fileExt}.gz`);

    var total = stats2.size + stats3.size;
    if (total > 65535) {
        if (!pack) {
            fs.appendFileSync('history.txt',
                `${new Date()} | Total size: ${total}, exceeding by ${total - 65535} | \n`);
            console.warn(`Total size: ${total}, exceeding by ${total - 65535}`);
        } else {
            console.warn(`${minAffixesCount}-${maxWordLength} size: ${total}, exceeding by ${total - 65535}`);
        }
    } else {
        if (!pack) {
            fs.appendFileSync('history.txt',
                `${new Date()} | Total size: ${total} | \n`);
            console.log(`Total size: ${total}`);
        } else {
            console.log(`${minAffixesCount}-${maxWordLength} size: ${total}`);
        }

    }

    return {size: total, count: totalCount};
};


if (PACK) {
// Guessing best solution
    let maxCount = 0;
    let bestAffixesCount = 0;
    let bestWordLength = 0;
    let bestSize = 0;
    for (let minAffixesCount = 2; minAffixesCount <= 15; ++minAffixesCount) {
        let prev = 0;
        for (let maxWordLength = 4; maxWordLength <= 25; ++maxWordLength) {
            let {size, count} = generateSolution(true, minAffixesCount, maxWordLength);
            if (size <= 65535 && count > maxCount) {
                bestAffixesCount = minAffixesCount;
                bestWordLength = maxWordLength;
                bestSize = size;
                maxCount = count;
            }
            if (size > 65535 || prev == size) {
                // maxWordLength is at max
                break;
            }
            prev = size;
        }
    }

    console.log(`Best solution ${bestAffixesCount}-${bestWordLength}: ${maxCount} (${bestSize} bytes)`);

    childProcess.execSync(`cp variants/data.${bestAffixesCount}-${bestWordLength}.gz solution/data.gz`);
    childProcess.execSync(`cp variants/solution.${bestAffixesCount}-${bestWordLength}.js solution/solution.js`);
} else {
    generateSolution(false);
    childProcess.execSync(`cp variants/data.0-0.gz solution/data.gz`);
    childProcess.execSync(`cp variants/solution.0-0.js solution/solution.js`);
}
