const fs = require('fs');

class BloomFilter{
  constructor(words, probability = 0.1){
    this.seeds = [4202703683, 2924307102, 1544947091, 3069433759]; 
    this.FNVPRIME = 0x01000193;
    this.name = "";

    if(words){
      this.setup(words, probability)
    }
  }

  setup(words, probability){
    this.words = words;
    this.size = this.calculateSize(words.length, probability)
    this.bitBuffer = new Buffer(Math.ceil(this.size.bits / 8));
    this.bitBuffer.fill(0);
    this.addWords();
  }

  calculateSize(n, p){
    var m = Math.ceil((n * Math.log(p)) / Math.log(1.0 / (Math.pow(2.0, Math.log(2.0)))));
    var k = Math.round(Math.log(2.0)*m/ n);
    var bytes = Math.ceil(m / 8);

    return { bits: (bytes * 8), hashes: k };
  }

  setBit(value){
    var pos = 0, 
        bitField,
        shift = value;

    while(shift > 7){
      pos++;
      shift -= 8;
    }

    bitField = this.bitBuffer[pos];
    bitField |= (0x1 << shift);
    this.bitBuffer[pos] = bitField;
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

  add(word){
    var wordBuffer = new Buffer(word);
  
    for (var i = 0, l = this.size.hashes; i < l; i++){
      var hash = this.fnv1s(word, this.seeds[i]);
      var bit = hash % this.size.bits;
      this.setBit(bit);
    }
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

  addWords(){
    var self = this;

    self.words.forEach((word) => {
      self.add(word); 
    })
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

  exportToFile(file){
    var self = this;

    fs.open(file, 'w', (err, fd) => {
      if (err) {
        throw `error opening file: ${err}`;
      }

      fs.write(fd, self.bitBuffer, 0, self.bitBuffer.length, 0, (err) => {
        if (err) {
          throw `error writing file: ${err}`;
        }

        fs.close(fd, () => {
          console.log(`file ${file} written`);
        })
      });
    });
  }

  static loadFromFile(file, name = ''){
    const filter = new BloomFilter();
    var data = fs.readFileSync(file);

    filter.size = {
      bits: data.length * 8,
      hashes: 3
    }

    filter.bitBuffer = new Buffer(data);
    return filter;
  }

  static loadFromBuffer(buffer, name = ''){
    const filter = new BloomFilter();
    
    filter.size = {
      bits: buffer.length * 8,
      hashes: 3
    }

    filter.bitBuffer = buffer;
    return filter;    
  }

}

module.exports = BloomFilter;
