'use strict';

const treatAsPrefix = true;
const treatAsSubstring = true;
const minOccurs = 100;
const minRank = .2;
const minLength = 4;

console.log('getting %ses...', treatAsPrefix ? 'prefix' : 'suffix');

const fs = require('fs');

let allWords = fs.readFileSync('words.txt', 'utf-8').toLowerCase().split(/\s+/g);

let allWordsDict = {};
let tree = {ch: '', count: 0};

console.log('building tree...');
for (let word of allWords) {
    allWordsDict[word] = true;
    let maxStart = treatAsSubstring ? word.length - 1 : 1;
    for (let start = 0; start < maxStart; start++) {
        let node = tree;
        for (let i = start; i < Math.min(word.length - 1, start + minLength + 2); i++) {
            let ch = word[treatAsPrefix ? i : word.length - i - 1];
            if (!node[ch]) {
                node[ch] = {count: 0, parent: node, ch: ch};
            }
            node = node[ch];
            node.count++;
        }
    }
}

let prefixes = [];

console.log('getting prefixes from tree...');
traverse(tree, 1);

prefixes.sort((x, y) => y.count - x.count);
console.log(prefixes.map(p => p.prefix + ': ' + p.count).join('\n'));
process.exit(0);

console.log('processing prefixes...');
prefixes.sort((x, y) => y.count - x.count);
prefixes.forEach(prefix => {
    prefix.with = 0;
    prefix.without = 0;
    for (let word of allWords) {
        if (word.length > prefix.prefix.length) {
            if (treatAsSubstring) {
                if (word.indexOf(prefix.prefix) > 0) {
                    prefix.with++;
                    if (allWordsDict[word.replace(prefix.prefix, '')]) {
                        prefix.without++;
                    }
                }
            } else if ((treatAsPrefix ? word.startsWith(prefix.prefix) : word.endsWith(prefix.prefix))) {
                prefix.with++;
                let subPart = treatAsPrefix ? word.substr(prefix.prefix.length) : word.substr(0, word.length - prefix.prefix.length);
                if (allWordsDict[subPart]) {
                    prefix.without++;
                }
            }
        }
    }
    prefix.rank = prefix.without / prefix.with;
    console.log(prefix.prefix, prefix.count, prefix.with, prefix.without, prefix.rank.toFixed(2));
});

prefixes = prefixes.sort((x, y) => y.rank - x.rank).filter(p => p.rank > minRank);

console.log(prefixes.slice(0, 100));
console.log(prefixes.map(p => p.prefix).join('|'));

function traverse(node, depth) {
    Object.keys(node).forEach(ch => {
        if (ch.length === 1 && node[ch].count > minOccurs) {
            let childNode = node[ch];
            if (depth >= minLength)
            processItem(childNode);
            traverse(childNode, depth + 1);
        }
    });
}

function processItem(node) {
    let str = [];
    let count = node.count;
    while (node) {
        str.push(node.ch);
        node = node.parent;
    }
    if (treatAsPrefix) {
        str = str.reverse();
    }
    prefixes.push({ prefix: str.join(''), count: count });
}
