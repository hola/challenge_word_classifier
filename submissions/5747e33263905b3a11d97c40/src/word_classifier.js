const Config = {
  subWordRanges: [[0, 3], [3, 7], [7, 12], [12, null]],
  seeds: [4202703683, 2924307102, 1544947091, 3069433759],
  FNVPRIME: 0x01000193
}

class BloomFilter{
  constructor(buffer, config = null){
    var _config = config || Config;

    this.seeds = _config.seeds; 
    this.FNVPRIME = _config.FNVPRIME;
    this.subWordRanges = _config.subWordRanges;
    this.size = { bits: buffer.length * 8, hashes: 3 };
    this.bitBuffer = buffer;
  }

  fnv1s(word, seed) {
    var hash = seed,
        buffer = new Buffer(word);

    for (var i=0, l = buffer.length;  i < l; i++) {
      hash *= this.FNVPRIME;
      hash ^= buffer[i];
    }

    return Math.abs(hash);
  }

  findBit(bit){
    var pos = 0,
        bitField,
        shift = bit;

    while (shift > 7) {
      pos++;
      shift -= 8;
    }

    var bitField = this.bitBuffer[pos];
    return (bitField & (0x1 << shift)) !== 0;
  }

  exists(word) {
    for (var i = 0, l = this.size.hashes; i < l; i++){
      var hash = this.fnv1s(word, this.seeds[i]);
      var bit = hash % this.size.bits;

      if(!this.findBit(bit)){
        return false;
      }
    }
    return true
  }

  static importFromBuffer(data, count = 4){
    var buffer = new Buffer(data);
    var filters = [],
        offset = 0,
        sizes = [];

    for(var i = 0; i < count; i++){
      sizes.push(buffer.readInt32LE(offset));
      offset = offset + 4;
    }

    for(var i = 0; i < count; i++){
      var bitBuffer = Buffer.alloc(sizes[i]);

      buffer.copy(bitBuffer, 0, offset, offset + bitBuffer.length);
      offset = offset + bitBuffer.length;

      filters.push(new BloomFilter(bitBuffer));
    }

    return filters;
  }

  static splitWord(word, subWordRanges = null){
    var subWords = [],
        lword = word.toLowerCase(),
         _subWordRanges = subWordRanges || Config.subWordRanges;

    _subWordRanges.forEach((range, i) => {
      var subWord = lword.slice(range[0], range[1] || lword.length);

      if(subWord.length){
        subWords.push(subWord);
      }
    });

    return subWords;
  }
}

var bloomFilters;

function init(data){
  bloomFilters = BloomFilter.importFromBuffer(data);
}

function test(word){
  var subWords = BloomFilter.splitWord(word),
      present = true;

  subWords.forEach( (sw, i) => {
    present = present && bloomFilters[i].exists(sw);
  })

  return present;
}

module.exports = {
  init: init,
  test: test
};
