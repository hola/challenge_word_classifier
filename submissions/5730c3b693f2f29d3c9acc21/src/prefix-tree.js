'use strict';
const common = require('./common')
const MAX_DEEP = require('./config').MAX_DEEP
const ALPHABET = common.ALPHABET
const ALPHABET_LENGTH = common.ALPHABET_LENGTH
const normalize = common.normalize

class HuffmanTree {
    constructor(scheme) {
        this.root = new Array(2)
        Object.keys(scheme).forEach(char => this.insert(char, scheme[char]))
    }
    
    insert(char, path) {
        let cur = this.root
        const l = path.length - 1
        path.split('').forEach((dir, idx) => {
            if (dir === '0') {
                if (idx === l) {
                    cur[0] = char
                }
                else {
                    cur = cur[0] || (cur[0] = [])
                }
            }
            else {
                if (idx === l) {
                    cur[1] = char
                }
                else {
                    cur = cur[1] || (cur[1] = [])
                }
            }
        })
    }
    
    read(reader) {
        let cur = this.root
        function readMore() {
            if (reader.bit()) {
                if (Array.isArray(cur[1])) {
                    cur = cur[1]
                    return readMore()
                }
                else {
                    return cur[1]
                }
            }
            else {
                if (Array.isArray(cur[0])) {
                    cur = cur[0]
                    return readMore()
                }
                else {
                    return cur[0]
                }
            }
        }
        return readMore()
    }
}

class BitReader {
    constructor(buffer) {
        this.buffer = new Uint8Array(buffer)
        this.cursor = 0
    }
    
    get(idx) {
        const bufferIdx = Math.floor(idx / 8)
        const bitIdx = 7 - (idx - bufferIdx * 8)
        const byte = this.buffer[bufferIdx]
        return (byte & (1 << bitIdx)) >> bitIdx
    }
    
    bit() {
        return this.get(this.cursor++)
    }
    
    char() {
        return ALPHABET[
            (this.bit() << 4) |
            (this.bit() << 3) |
            (this.bit() << 2) |
            (this.bit() << 1) |
            this.bit()
        ]
    }
    
    chars(n, codes) {
        if (n < 5) {
            const res = []
            for (let i = 0; i < n; i++) {
                res.push(codes[n + ':' + i].read(this))
            }
            return res
        }
        let i = 0;
        const chars = []
        while (i++ < n) {
            chars.push(this.char())
        }
        return chars
    }
}

function test(tree, word) {
    const normalized = normalize(word)
    let current = tree
    for (let i = 0, l = normalized.length; i < l; ++i) {
        const char = normalized[i]
        if ('prob' in current) {
            const prob = parseInt(current['prob'], 10)
            const deep = current.deep === '18+' ? 18 : parseInt(current.deep, 10)
            if (normalized.length - i > parseInt(current.deep, 10)) {
                return false
            }
            return Math.random() < (1 - Math.pow(1 / prob, 2) - Math.pow(1 / deep, Math.E))
        }
        if (!(char in current)) {
            return false
        }
        current = current[char]
    }
    return true
}

function deserialize(buffer, tables, maxDeep) {
    const codes = Object.keys(tables).reduce((all, group) => {
        all[group] = new HuffmanTree(tables[group])
        return all
    }, {})
    if (!maxDeep) { maxDeep = MAX_DEEP }
    const reader = new BitReader(buffer)
    function readNode(level) {
        const result = {}
        let chars = []
        const length = codes.length.read(reader)
        switch (length) {
            case '0': {
                chars = ['$']
                break
            }
            case '1':
            case '2':
            case '3':
            case '4': {
                chars = reader.chars(parseInt(length, 10), codes)
                break
            }
            default: {
                for (let i = 0; i < ALPHABET_LENGTH; ++i) {
                    if (reader.bit()) {
                        chars.push(ALPHABET[i])
                    }
                }
            }
        }
        for (let i = 0, l = chars.length; i < l; ++i) {
            const char = chars[i]
            if (char !== '$') {
                if (level < maxDeep) {
                    result[char] = readNode(level + 1)
                }
                else {
                    const deep = codes.deep.read(reader)
                    if (deep === '1') {
                        result[char] = {'$': {}}
                    }
                    else {
                        const prob = codes.prob.read(reader)
                        result[char] = {'deep': deep, 'prob': prob}
                    }
                }
            }
            else {
                result[char] = {}
            }
        }
        return result
    }
    return readNode(0)
}

module.exports = {
    deserialize: deserialize,
    test: test
}
