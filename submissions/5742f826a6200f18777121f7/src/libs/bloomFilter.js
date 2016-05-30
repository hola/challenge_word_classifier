/**
 *
 */
var fs = require('fs');

(function () {

    function Bloom() {
        var self = this;

        var _bloomSize = 0; // filter size in bits
        var _bloomSizeInBytes = 0;
        var _hashCounts;
        var _bloomFilter;

        var _bloomId = Math.random();

        this.bloomId = function () {
            return _bloomId;
        }();

        this.bloomSizeInBytes = function () {
            return _bloomSizeInBytes;
        };

        this.hashCounts = function () {
            return _hashCounts;
        };

        this.new = function (maxMembers, errorProbability) {
            var sizeInBits = -(maxMembers * Math.log(errorProbability)) / (Math.LN2 * Math.LN2);

            _hashCounts = Math.round((sizeInBits / maxMembers) * Math.LN2);

            _bloomSizeInBytes = Math.ceil(sizeInBits / 8);
            _bloomSize = _bloomSizeInBytes * 8;

            _bloomFilter = new Uint8Array(_bloomSizeInBytes + 1);
            _bloomFilter[_bloomFilter.length - 1] = _hashCounts;
        };

        this.loadBloomFromBuffer = function (bloomBuffer) {
            _bloomFilter = new Uint8Array(bloomBuffer);
            _bloomSizeInBytes = _bloomFilter.length - 1;
            _bloomSize = _bloomSizeInBytes * 8;
            _hashCounts = _bloomFilter[bloomFilter.length - 1];
        };

        this.saveBloomToBuffer = function () {
            return Buffer.from(_bloomFilter.buffer);
        };

        this.loadBloomFromFile = function (filePath) {
            self.loadBloomFromBuffer(fs.readFileSync(filePath));
        };

        this.saveBloomToFile = function (filePath) {
            return fs.writeFileSync(filePath, self.saveBloomToBuffer());
        };

        this.train = function (word) {
            var hashes = calculateHashes(word);
            for (var i = 0; i < _hashCounts; i++) {
                setBit(hashes[i]);
            }
        };

        this.test = function (word) {
            var hashes = calculateHashes(word);
            for (var i = 0; i < _hashCounts; i++) {
                if (getBit(hashes[i]) === 0) {
                    return false;
                }
            }
            return true;
        };

        ////
        function setBit(bitIndex) {
            var byteIndex = Math.floor(bitIndex / 8);
            var bitIndexInByte = bitIndex % 8;

            return _bloomFilter[byteIndex] |= (1 << bitIndexInByte);
        }

        function getBit(bitIndex) {
            var byteIndex = Math.floor(bitIndex / 8);
            var bitIndexInByte = bitIndex % 8;

            return _bloomFilter[byteIndex] & (1 << bitIndexInByte);
        }

        function calculateHashes(word) {
            var calculatedHashes = [];
            for (var i = 0; i < _hashCounts; i++) {
                calculatedHashes[i] = murmurhash2_32_gc(word, (i + 32) << 2 + (i << 5) + (i << 15)) % _bloomSize;
            }

            return calculatedHashes;
        }

        /// https://github.com/garycourt/murmurhash-js
        function murmurhash2_32_gc(str, seed) {
            var
                l = str.length,
                h = seed ^ l,
                i = 0,
                k;

            while (l >= 4) {
                k =
                    ((str.charCodeAt(i) & 0xff)) |
                    ((str.charCodeAt(++i) & 0xff) << 8) |
                    ((str.charCodeAt(++i) & 0xff) << 16) |
                    ((str.charCodeAt(++i) & 0xff) << 24);

                k = (((k & 0xffff) * 0x5bd1e995) + ((((k >>> 16) * 0x5bd1e995) & 0xffff) << 16));
                k ^= k >>> 24;
                k = (((k & 0xffff) * 0x5bd1e995) + ((((k >>> 16) * 0x5bd1e995) & 0xffff) << 16));

                h = (((h & 0xffff) * 0x5bd1e995) + ((((h >>> 16) * 0x5bd1e995) & 0xffff) << 16)) ^ k;

                l -= 4;
                ++i;
            }

            switch (l) {
                case 3:
                    h ^= (str.charCodeAt(i + 2) & 0xff) << 16;
                case 2:
                    h ^= (str.charCodeAt(i + 1) & 0xff) << 8;
                case 1:
                    h ^= (str.charCodeAt(i) & 0xff);
                    h = (((h & 0xffff) * 0x5bd1e995) + ((((h >>> 16) * 0x5bd1e995) & 0xffff) << 16));
            }

            h ^= h >>> 13;
            h = (((h & 0xffff) * 0x5bd1e995) + ((((h >>> 16) * 0x5bd1e995) & 0xffff) << 16));
            h ^= h >>> 15;

            return h >>> 0;
        }

    }

    if (typeof exports !== 'undefined') {
        module.exports = Bloom;
    }

}());