'use strict';

const BYTE_SIZE = 8;

exports.destructive = (root) => {
    const bytes = [];
    const serializeNode = (node) => {
        const letters = Object.keys(node);
        letters.sort();
        for (let letter of letters) {
            bytes.push(letter.charCodeAt(0));
            serializeNode(node[letter]);
        }
    };
    serializeNode(root);
    return bytes;
};

const compress = (entries) => {
    const bytes = [];
    let byte = 0;
    let bitsFree = BYTE_SIZE;
    for (let entry of entries) {
        for (let bitIndex = entry.size - 1; bitIndex >= 0; --bitIndex) {
            if (bitsFree === 0) {
                bytes.push(byte);
                byte = 0;
                bitsFree = BYTE_SIZE;
            }
            const bitValue = (entry.encoding & (1 << bitIndex)) >> bitIndex;
            --bitsFree;
            byte = byte | (bitValue << bitsFree);
        }
    }
    bytes.push(byte);
    return bytes;
};

exports.bitmask = function (root, alphabet = '') {
    const maskSize = alphabet.length;
    const alphabetArr = alphabet.split('');
    alphabetArr.sort();
    const masks = [];
    const serializeNode = (node) => {
        let mask = 0;
        const keys = Object.keys(node);
        keys.sort();
        if (keys.length) {
            for (let i = 0; i < maskSize; ++i) {
                if (alphabetArr[i] in node) {
                    mask = mask | (1 << i);
                }
            }
            masks.push({
                size: maskSize + 1,
                encoding: mask | (1 << maskSize)
            });
            for (let key of keys) {
                serializeNode(node[key]);
            }
        } else {
            masks.push({
                size: 1,
                encoding: mask
            });
        }
    };
    serializeNode(root);
    return compress(masks, maskSize);
};

const createParser = function *(bytes, maskSize){
    let i = 0;
    let byte = bytes[i];
    let bitsLeft = BYTE_SIZE;
    while(true) {
        let mask = 0;
        for (let bit = maskSize; bit >= 0; --bit) {
            if (bitsLeft === 0) {
                byte = bytes[++i];
                bitsLeft = BYTE_SIZE;
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

exports.unbitmask = (bytes, alphabet = '') => {
    alphabet = alphabet.split('');
    alphabet.sort();
    const maskSize = alphabet.length;
    const generator = createParser(bytes, maskSize);
    const deserializeNode = () => {
        const node = {};
        const mask = generator.next().value;
        if (mask !== 0) {
            for (let i = 0; i < maskSize; ++i) {
                if (mask & (1 << i)) {
                    node[alphabet[i]] = deserializeNode();
                }
            }
        }
        return node;
    };
    return deserializeNode();
};

const createFrequencyMap = (root) => {
    const map = {
        '$': 0
    };
    const walker = (node) => {
        ++map['$'];
        Object.keys(node).forEach((key) => {
            if (key in map) {
                ++map[key];
            } else {
                map[key] = 1;
            }
            walker(node[key]);
        });
    };
    walker(root);

    return map;
};

const createEncoding = (map) => {
    const frequencyArray = [];
    Object.keys(map).forEach(key => {
        frequencyArray.push({
            key,
            frequency: map[key]
        });
    });
    const pickLowest = () => {
        let lowest = { frequency: Number.MAX_SAFE_INTEGER };
        for (let entry of frequencyArray) {
            if (entry.frequency < lowest.frequency) {
                lowest = entry;
            }
        }
        frequencyArray.splice(frequencyArray.indexOf(lowest), 1);
        return lowest;
    };
    const pickTwoLowest = () => [pickLowest(), pickLowest()];
    while (frequencyArray.length >= 2) {
        const [right, left] = pickTwoLowest();
        const result = {
            key: left.key + right.key,
            frequency: left.frequency + right.frequency,
            left,
            right
        };
        frequencyArray.push(result);
    }
    const encodingMap = {};
    const constructEncodingMapping = (node, encoding = 0, bit = 0, size = 0) => {
        if (!node) {
            return;
        }
        encoding = encoding | bit;
        if (node.key.length === 1) {
            encodingMap[node.key] = {
                encoding,
                size
            };
        } else {
            constructEncodingMapping(node.left, encoding << 1, 0, size + 1);
            constructEncodingMapping(node.right, encoding << 1, 1, size + 1);
        }
    };
    const constructDecodingMapping = (originalNode) => {
        if (originalNode.key.length === 1) {
            return originalNode.key;
        }
        return {
            0: constructDecodingMapping(originalNode.left),
            1: constructDecodingMapping(originalNode.right)
        };
    };
    constructEncodingMapping(frequencyArray[0]);
    return { encodingMap, decodingMap: constructDecodingMapping(frequencyArray[0]) };
};

exports.huffman = (root) => {
    const frequencyMap = createFrequencyMap(root);
    const { encodingMap, decodingMap } = createEncoding(frequencyMap);
    const uncompressed = [];
    const serializeNode = (node) => {
        const keys = Object.keys(node);
        for (let key of keys) {
            uncompressed.push(encodingMap[key]);
        }
        uncompressed.push(encodingMap['$']);
        for (let key of keys) {
            serializeNode(node[key]);
        }
    };
    serializeNode(root);
    const serializedDecodingMap = Array.from(JSON.stringify(decodingMap)).map(char => char.charCodeAt(0));
    serializedDecodingMap.unshift(serializedDecodingMap.length);
    return serializedDecodingMap.concat(compress(uncompressed));
};

const unhuffmanGenerator = function *(bytes, decodingMap){
    let bitsLeft = 0;
    let byte;
    while(bytes.length || bitsLeft) {
        let char = decodingMap;
        while (typeof(char) === 'object') {
            if (bitsLeft === 0) {
                byte = bytes.shift();
                bitsLeft = BYTE_SIZE;
            }
            --bitsLeft;
            const bit = (byte & (1 << bitsLeft)) >> bitsLeft;
            char = char[bit];
        }
        yield char;
    }
};

exports.unhuffman = (bytes) => {
    const decodingMapSize = bytes.shift();
    const decodingMap = JSON.parse(bytes.splice(0, decodingMapSize).map(code => String.fromCharCode(code)).join(''));
    const generator = unhuffmanGenerator(bytes, decodingMap);
    const deserializeNode = () => {
        const node = {};
        const keys = [];
        for (let current = generator.next(); !current.done && current.value !== '$'; current = generator.next()) {
            keys.push(current.value);
        }
        for (let key of keys) {
            node[key] = deserializeNode();
        }
        return node;
    };
    return deserializeNode();
};
