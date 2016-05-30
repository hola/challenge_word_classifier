function packToBuffer(buf, hashFunc, word) {
    let bWord = word,
        vLength = 7,
        res = '';

    if (bWord.length > vLength + 1) {

        for (let i = 0; i < bWord.length; i += vLength - 2) {
            let four = bWord.substr(i, vLength),
                l = four.length;
            for (let j = 0; j < vLength - l; j++) {
                four += '0';
            }
            res += pack(buf, hashFunc, four);
            res += '\n'
        }

    } else {

        res = pack(buf, hashFunc, bWord) + '\n';

    }

    return res;
}

function pack(buf, hashFunc, word) {
    let hash = hashFunc(word),
        outIndex = Math.floor(hash / 8),
        pow = hash % 8;

    buf[outIndex] = buf[outIndex] | (0x01 << (7 - pow));
    return hash;
}

module.exports = {
    packToBuffer: packToBuffer
};