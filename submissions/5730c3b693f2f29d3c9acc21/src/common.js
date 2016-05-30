'use strict';

class BitArray {
    constructor(capacityOrBuffer) {
        const capacity = typeof capacityOrBuffer === 'number' ? capacityOrBuffer : 32
        this.buffer = typeof capacityOrBuffer === 'number'
            ? new Uint8Array(Math.ceil(capacity / 8))
            : capacityOrBuffer
    }
    
    set(idx, value) {
        const bufferIdx = Math.floor(idx / 8)
        const bitIdx = 7 - (idx - bufferIdx * 8)
        if (bufferIdx >= this.buffer.length) {
            this.grow()
            this.set(idx, value)
        }
        const byte = this.buffer[bufferIdx]
        if (value) {
            this.buffer[bufferIdx] = byte | (1 << bitIdx)
        }
        else {
            this.buffer[bufferIdx] = byte & (~(1 << bitIdx))
        }
    }
    
    get(idx) {
        const bufferIdx = Math.floor(idx / 8)
        const bitIdx = 7 - (idx - bufferIdx * 8)
        if (bufferIdx >= this.buffer.length) {
            throw new Error('out of range')
        }
        const byte = this.buffer[bufferIdx]
        return (byte & (1 << bitIdx)) >> bitIdx
    }
    
    toString() {
        let res = ''
        const l = this.buffer.length * 8
        for (let i = 0; i < l; i++) {
            res += this.get(i)
        }
        return res
    }
    
    grow() {
        const newLength = this.buffer.length * 2
        const newBuffer = new Uint8Array(newLength)
        newBuffer.set(this.buffer, 0)
        this.buffer = newBuffer
    }
}

const ALPHABET = "abcdefghijklmnopqrstuvwxyz'$"
const ALPHABET_LENGTH = ALPHABET.length

function normalize(word) {
    return word.toLowerCase() + '$'
}

module.exports = {
    ALPHABET: ALPHABET,
    ALPHABET_LENGTH: ALPHABET_LENGTH,
    normalize: normalize,
    BitArray: BitArray
}
