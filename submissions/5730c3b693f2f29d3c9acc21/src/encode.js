'use strict';
const common = require('./common')
const MAX_DEEP = require('./config').MAX_DEEP
const ALPHABET = common.ALPHABET
const ALPHABET_LENGTH = common.ALPHABET_LENGTH
const normalize = common.normalize
const BitArray = common.BitArray

function sortedChars(node) {
    var res = []
    for (var i = 0; i < ALPHABET_LENGTH; i++) {
        var char = ALPHABET[i]
        if (char in node) {
            res.push(char)
        }
    }
    return res
}

class Stats {
    constructor(groupBy) {
        this.groupBy = groupBy || (key => key)
        this.hits = {}
        this.total = 0
    }
    
    hit(key) {
        const mappedKey = this.groupBy(key)
        this.hits[mappedKey] = this.hits[mappedKey] ? this.hits[mappedKey] + 1 : 1
        this.total++
    }
    
    stats() {
        return Object.keys(this.hits).reduce((res, key) => {
            res[key] = this.hits[key] / this.total
            return res
        }, {})
    }
    
    print(name) {
        if (name) {
            console.log('Stats for ' + name + ':')
        }
        const stats = this.stats()
        const keys = Object.keys(stats).sort((a, b) => stats[a] - stats[b])
        keys.forEach(key => {
            console.log(key + ';' + stats[key].toFixed(5))
        })
    }
    
    huffman() {
        let symbols = Object.keys(this.hits).map(key => [key, this.hits[key]])
        while (symbols.length > 1) {
            symbols.sort((a, b) => a[1] - b[1])
            const least = symbols.slice(0, 2)
            symbols = symbols.slice(2)
            symbols.push([[least[0], least[1]], least[0][1] + least[1][1]])
        }
        if (symbols[0][1] !== this.total) {
            throw new Error('Symbols hits sum should be equal to total hits count')
        }
        function calcCodes(symbols) {
            const symbol = symbols[0]
            if (!Array.isArray(symbol)) {
                return { [symbol]: '' }
            }
            const left = calcCodes(symbol[0])
            const right = calcCodes(symbol[1])
            return Object.keys(left).reduce(
                (res, sym) => (res[sym] = '0' + left[sym], res),
                Object.keys(right).reduce(
                    (res, sym) => (res[sym] = '1' + right[sym], res),
                    {}
                )
            )
        }
        return calcCodes(symbols[0])
    }
    
    averageSize() {
        const huffman = this.huffman()
        const stats = this.stats()
        return Object.keys(this.hits).reduce((sum, sym) => sum + stats[sym] * huffman[sym].length, 0)
    }
}

class BitWriter {
    constructor(capacity) {
        this.array = new BitArray(capacity)
        this.cursor = 0
    }
    
    bit(val) {
        this.array.set(this.cursor++, val)
    }
    
    char(char) {
        const idx = ALPHABET.indexOf(char)
        this.bit((1 << 4) & idx)
        this.bit((1 << 3) & idx)
        this.bit((1 << 2) & idx)
        this.bit((1 << 1) & idx)
        this.bit((1 << 0) & idx)
    }
    
    chars(chars, tables) {
        const l = chars.length
        if (l < 5) {
            this.str(tables.length[l])
            chars.forEach((char, idx) => {
                this.str(tables[chars.length + ':' + idx][char])
            })
            return
        }
        this.str(tables.length['5+'])
        for (let i = 0, l = chars.length; i < l; ++i) {
            this.char(chars[i])
        }
    }
    
    str(str) {
        for (let i = 0, l = str.length; i < l; ++i) {
            this.bit(str[i] !== '0')
        }
    }
    
    buffer() {
        return this.array.buffer.buffer.slice(0, Math.ceil(this.cursor / 8))
    }
}

function insert(tree, word) {
    const normalized = normalize(word)
    let current = tree
    for (let i = 0; i < normalized.length; ++i) {
        const char = normalized[i]
        current = current[char] || (current[char] = {})
    }
}

function nodeSize(node) {
    return 1 + Object.keys(node).reduce(
        (sum, char) => sum + nodeSize(node[char]),
        0
    )
}

function nodeProb(node) {
    const size = nodeSize(node)
    const steps = [2048, 1024, 512, 256, 128, 64, 32, 16, 8, 4, 2, 1]
    let prob = 0
    steps.forEach((val, idx) => {
        if (!prob && size & val) {
            prob = steps.length - idx
        }
    })
    return prob
}

function nodeDeep(node) {
    return 1 + Object.keys(node).reduce(
        (max, char) => Math.max(max, nodeDeep(node[char])),
        0
    )
}

function walkTree(tree, onNode, onLeafChar, maxDeep) {
    if (!maxDeep) { maxDeep = MAX_DEEP }
    function loop(node, level) {
        if (!onNode(node)) {
            return
        }
        if (level >= maxDeep) {
            for (let i = 0; i < ALPHABET_LENGTH; i++) {
                const char = ALPHABET[i]
                if (char in node && char !== '$') {
                    onLeafChar(node[char])
                }
            }
            return
        }
        for (let i = 0; i < ALPHABET_LENGTH; i++) {
            const char = ALPHABET[i]
            if (char in node && char !== '$') {
                loop(node[char], level + 1)
            }
        }
    }
    loop(tree, 0)
}

function tables(tree, maxDeep) {
    const stats = {
        length: new Stats(n => n > 4 ? '5+' : n),
        prob: new Stats(),
        deep: new Stats(n => n < 18 ? n : '18+'),
        '1:0': new Stats(),
        '2:0': new Stats(),
        '2:1': new Stats(),
        '3:0': new Stats(),
        '3:1': new Stats(),
        '3:2': new Stats(),
        '4:0': new Stats(),
        '4:1': new Stats(),
        '4:2': new Stats(),
        '4:3': new Stats()
    }
    function hit(chars) {
        chars.forEach((char, idx) => {
            stats[chars.length + ':' + idx].hit(char)
        })
    }
    function onNode(node) {
        const chars = sortedChars(node)
        const l = chars.length
        if (l > 1 || chars[0] !== '$') {
            stats.length.hit(l)
            if (l < 5) {
                hit(chars)
            }
            return true
        }
        stats.length.hit(0)
        return false
    }
    function onLeadChar(char) {
        const deep = nodeDeep(char) - 1
        stats.deep.hit(deep)
        if (deep > 1) {
            const group = nodeProb(char)
            stats.prob.hit(group)
        }
    }
    walkTree(tree, onNode, onLeadChar, maxDeep)
    return Object.keys(stats).reduce(
        (all, st) => (all[st] = stats[st].huffman(), all),
        {}
    )
}

function serialize(tree, tables, maxDeep) {
    const result = new BitWriter(ALPHABET_LENGTH)
    function onNode(node) {
        const chars = sortedChars(node)
        if (chars.length === 1 && chars[0] === '$') {
            result.str(tables.length['0'])
            return false
        }
        if (chars.length < 5) {
            result.chars(chars, tables)
            return true
        }
        result.str(tables.length['5+'])
        for (let i = 0; i < ALPHABET_LENGTH; i++) {
            result.bit(ALPHABET[i] in node)
        }
        return true
    }
    function onLeafChar(char) {
        const deep = nodeDeep(char) - 1
        result.str(tables.deep[deep < 18 ? deep : '18+'])
        if (deep > 1) {
            const prob = nodeProb(char)
            result.str(tables.prob[prob])
        }
    }
    walkTree(tree, onNode, onLeafChar)
    return result.buffer()
}

module.exports = {
    serialize: serialize,
    tables: tables,
    insert: insert
}
