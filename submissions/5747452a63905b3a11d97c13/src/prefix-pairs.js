'use strict';

const minOccurs = 100;
const minLength = 2;
const treatAsSuffix = false;
const logFoundPrefixes = false;

console.log('getting prefix pairs...');

const fs = require('fs');

let allWords = fs.readFileSync('tmp/simple.txt', 'utf-8').toLowerCase().split(/\s+/g);
if (treatAsSuffix) {
    for (let i = 0; i < allWords.length; i++) {
        allWords[i] = allWords[i].replace(/'s$/, '').split('').reverse().join('');
    }
}

let allWordsDict = {};
let tree = {ch: '', count: 0};

for (let word of allWords) {
    allWordsDict[word] = true;
}
allWords = Object.keys(allWordsDict).sort();

console.log('building prefix tree...');
for (let word of allWords) {
    let node = tree;
    for (let i = 0; i < word.length; i++) {
        let ch = word[i];
        if (!node[ch]) {
            node[ch] = {count: 0, parent: node, ch: ch};
        }
        node = node[ch];
        node.count++;
    }
}

let prefixes = {};

console.log('getting prefixes from tree...');
traversePrefixTree(tree, 1);

console.log('found %d prefixes with min length: %d, min occurs: %d', Object.keys(prefixes).length, minLength, minOccurs);

console.log('building word tree...');
tree = {ch: '', count: 0};
for (let word of allWords) {
    let node = tree;
    for (let i = word.length - 1; i >= -1; i--) {
        let ch = i < 0 ? '0' : word[i];
        if (!node[ch]) {
            node[ch] = {count: 0, parent: node, ch: ch};
        }
        node = node[ch];
        node.count++;
    }
}

let prefixTree = {};
console.log('building prefix tree from prefixes...');
for (let prefix of Object.keys(prefixes)) {
    let node = prefixTree;
    for (let i = prefix.length - 1; i >= -1; i--) {
        let ch = prefix[i] || '0';
        if (!node[ch]) {
            node[ch] = {count: 0, parent: node, ch: ch};
        }
        if (ch === '0') {
            node[ch].prefix = treatAsSuffix ? prefix.split('').reverse().join('') : prefix;
        }
        node = node[ch];
        node.count++;
    }
}

console.log('processing words...');
let prefixPairs = {};
let processedNodesCount = 0;
console.log('nodes count: %d', getNodesCount(tree));
traverseWordTree(tree);
console.log('');

let prefixPairsStr = Object.keys(prefixPairs)
    .filter(pp => prefixPairs[pp] > 50)
    .sort((x, y) => prefixPairs[y] - prefixPairs[x])
    .map(pp => pp + ': ' + prefixPairs[pp])
    .join('\n');

fs.writeFileSync('tmp/' + (treatAsSuffix ? 'suffix' : 'prefix') + '-pairs.txt', prefixPairsStr);
console.log('done. found pairs: %d', Object.keys(prefixPairs).length);

function traversePrefixTree(node, depth) {
    Object.keys(node).forEach(ch => {
        if (ch.length === 1 && node[ch].count >= minOccurs) {
            let childNode = node[ch];
            if (depth >= minLength) {
                processPrefix(childNode);
            }
            traversePrefixTree(childNode, depth + 1);
        }
    });
}

function processPrefix(node) {
    let str = [];
    let count = node.count;
    while (node) {
        str.push(node.ch);
        node = node.parent;
    }
    str = str.reverse();
    let prefix = str.join('');
    prefixes[prefix] = count;
}

function getNodesCount(node) {
    let count = 0;
    Object.keys(node).forEach(ch => {
        if (ch.length === 1 && ch !== '0') {
            let childNode = node[ch];
            count += 1 + getNodesCount(childNode);
        }
    });
    return count;
}

function traverseWordTree(node) {
    Object.keys(node).forEach(ch => {
        if (ch.length === 1 && ch !== '0') {
            let childNode = node[ch];
            processWord(childNode);
            processedNodesCount++;
            if (processedNodesCount % 10000 === 0) {
                process.stdout.write('.');
            }
            traverseWordTree(childNode);
        }
    });
}

function processWord(wordNode) {
    let wordPrefixes = [];
    findWordPrefixes(prefixTree, wordNode, wordPrefixes);
    if (wordPrefixes.length > 1) {
        for (let i = 0; i < wordPrefixes.length; i++) {
            for (let j = i + 1; j < wordPrefixes.length; j++) {
                let prefixPairKey = [wordPrefixes[i], wordPrefixes[j]].sort().join('|');
                prefixPairs[prefixPairKey] = (prefixPairs[prefixPairKey] || 0) + 1;
            }
        }
        if (logFoundPrefixes) {
            let wordPart = '';
            let currentNode = wordNode;
            while (currentNode) {
                wordPart += currentNode.ch;
                currentNode = currentNode.parent;
            }
            console.log('[' + wordPrefixes + '] ' + wordPart);
        }
    }
}

function findWordPrefixes(prefixTreeNode, wordNode, wordPrefixes) {
    Object.keys(prefixTreeNode).forEach(ch => {
        if (ch.length === 1 && wordNode[ch]) {
            if (ch === '0') {
                wordPrefixes.push(prefixTreeNode[ch].prefix);
            } else {
                findWordPrefixes(prefixTreeNode[ch], wordNode[ch], wordPrefixes);
            }
        }
    });
}
