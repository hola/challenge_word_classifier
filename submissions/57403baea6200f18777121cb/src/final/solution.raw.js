'use strict';

const createParser = function *(bytes, maskSize){
    let bitsLeft = 0,
        byte;
    for(;;) {
        let mask = 0;
        for (let bit = maskSize; bit >= 0; --bit) {
            if (bitsLeft === 0) {
                byte = bytes.shift();
                bitsLeft = 8;
            }
            --bitsLeft;
            const maskBit = (byte & (1 << bitsLeft)) >> bitsLeft;
            if (bit === maskSize) {
                if (!maskBit) {
                    break;
                }
            } else {
                mask = mask | (maskBit << bit);
            }
        }
        yield mask;
    }
};

const deserialize = (bytes, alphabet = '') => {
    alphabet = alphabet.split('');
    alphabet.sort();
    const maskSize = alphabet.length,
          parser = createParser(bytes, maskSize),
          deserializeNode = (node) =>
    {
        const mask = parser.next().value;
        if (mask === 0) {
            return {};
        }
        for (let i = 0; i < maskSize; ++i) {
            if (mask & (1 << i)) {
                node[alphabet[i]] = deserializeNode({});
            }
        }
        return node;
    };
    return deserializeNode({});
};

const trees = [];

const parseTree = (data, size, alphabet, wrapper, span = 20) => {
    const bytes = data.splice(0, size),
          r = new RegExp(`[^${alphabet}]`, 'g');
    wrapper.tree = deserialize(bytes, alphabet);
    wrapper.transform = word => word.toLowerCase().replace(r, '').slice(0, span);
    return wrapper;
};

exports.init = (data) => {
    data = Array.from(data);
    trees.push(parseTree(data, 57956, 'etaoins', {}, 7));
    trees.push(parseTree(data, 5331, 'zqxjkvbpygfwm', {}, 7));
    trees.push(parseTree(data, 2308, 'hrdlc', {}, 7));
    trees.push(parseTree(data, 3834, 'opnszq', {}, 7));
    trees.push(parseTree(data, 3158, `abcdefghijklmnopqrstuvwxyz'`, { negative: true, span: 3 }))
};

const treeMatches = (word, node) => {
    if (word === "") {
        return true;
    }
    if (!node[word[0]]) {
        return false;
    }
    return treeMatches(word.slice(1), node[word[0]]);
};

exports.test = (originalWord) => {
    // This is true more times than not
    if (originalWord.includes(`'`) && !originalWord.endsWith(`'s`)) {
        return false;
    }
    // Using saved lookup trees
    for (let treeWrapper of trees) {
        if (treeWrapper.negative) { // this checks for sequences that don't exist
            for (let i = 0; i + treeWrapper.span < originalWord.length; ++i) {
                if (treeMatches(originalWord.substr(i, treeWrapper.span), treeWrapper.tree)) {
                    return false;
                }
            }
        } else { // this checks for correct sequences
            const word = treeWrapper.transform(originalWord);
            if (!treeMatches(word, treeWrapper.tree)) {
                return false;
            }
        }
    }
    // Most of the times words don't consist just of consonants
    if (originalWord.match(/^[bcdfghjklmnpqrstvwxz]+$/g)) {
        return false;
    }
    // Most of the times words don't have 5 consonants in arow
    if (originalWord.match(/[bcdfghjklmnpqrstvwxz]{5}/)) {
        return false;
    }
    // This sequences never occur in the words
    if (originalWord.match(/fx|gx|hx|jq|jx|jz|px|qc|qh|qj|qv|qx|qy|qz|vb|vj|vq|wx|xj|zx/)) {
        return false;
    }
    return true;
};
