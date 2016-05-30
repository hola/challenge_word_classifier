var typedArrays = typeof ArrayBuffer !== "undefined";

// Creates a new bloom filter.  If *m* is an array-like object, with a length
// property, then the bloom filter is loaded with data from the array, where
// each element is a 32-bit integer.  Otherwise, *m* should specify the
// number of bits.  Note that *m* is rounded up to the nearest multiple of
// 32.  *k* specifies the number of hashing functions.
function BloomFilter(m, k) {
  var a;
  if (typeof m !== "number") { a = m, m = a.length * 32 }

  var n = Math.ceil(m / 32),
      i = -1;
  this.m = m = n * 32;
  this.k = k;

  if (typedArrays) {
    let kbytes = 1 << Math.ceil(Math.log(Math.ceil(Math.log(m) / Math.LN2 / 8)) / Math.LN2),
        array = kbytes === 1 ? Uint8Array : kbytes === 2 ? Uint16Array : Uint32Array,
        kbuffer = new ArrayBuffer(kbytes * k),
        buckets = this.buckets = new Int32Array(n);
    if (a) { while (++i < n) { buckets[i] = a[i] } }
    this._locations = new array(kbuffer);
  } else {
    let buckets = this.buckets = [];
    if (a) { while (++i < n) { buckets[i] = a[i] } }
    else { while (++i < n) { buckets[i] = 0 } }
    this._locations = [];
  }
}

// See http://willwhim.wpengine.com/2011/09/03/producing-n-hash-functions-by-hashing-only-once/
BloomFilter.prototype.locations = function(v) {
  var k = this.k,
      m = this.m,
      r = this._locations,
      a = fnv_1a(v),
      b = fnv_1a_b(a),
      x = a % m;
  for (var i = 0; i < k; ++i) {
    r[i] = x < 0 ? (x + m) : x;
    x = (x + b) % m;
  }
  return r;
};

BloomFilter.prototype.add = function(v) {
  var l = this.locations(v + ""),
      k = this.k,
      buckets = this.buckets;
  for (var i = 0; i < k; ++i) { buckets[Math.floor(l[i] / 32)] |= 1 << (l[i] % 32) }
};

BloomFilter.prototype.test = function(v) {
  var l = this.locations(v + ""),
      k = this.k,
      buckets = this.buckets;
  for (var i = 0; i < k; ++i) {
    var b = l[i];
    if ((buckets[Math.floor(b / 32)] & (1 << (b % 32))) === 0) {
      return false;
    }
  }
  return true;
};

// Estimated cardinality.
BloomFilter.prototype.size = function() {
  var buckets = this.buckets,
      bits = 0;
  for (var i = 0, n = buckets.length; i < n; ++i) { bits += popcnt(buckets[i]) }
  return -this.m * Math.log(1 - bits / this.m) / this.k;
};

// http://graphics.stanford.edu/~seander/bithacks.html#CountBitsSetParallel
function popcnt(v) {
  v -= (v >> 1) & 0x55555555;
  v = (v & 0x33333333) + ((v >> 2) & 0x33333333);
  return ((v + (v >> 4) & 0xf0f0f0f) * 0x1010101) >> 24;
}

// Fowler/Noll/Vo hashing.
function fnv_1a(v) {
  var a = 2166136261;
  for (var i = 0, n = v.length; i < n; ++i) {
    var c = v.charCodeAt(i),
        d = c & 0xff00;
    if (d) { a = fnv_multiply(a ^ d >> 8) }
    a = fnv_multiply(a ^ c & 0xff);
  }
  return fnv_mix(a);
}

// a * 16777619 mod 2**32
function fnv_multiply(a) {
  return a + (a << 1) + (a << 4) + (a << 7) + (a << 8) + (a << 24);
}

// One additional iteration of FNV, given a hash.
function fnv_1a_b(a) {
  return fnv_mix(fnv_multiply(a));
}

// See https://web.archive.org/web/20131019013225/http://home.comcast.net/~bretm/hash/6.html
function fnv_mix(a) {
  a += a << 13;
  a ^= a >>> 7;
  a += a << 3;
  a ^= a >>> 17;
  a += a << 5;
  return a & 0xffffffff;
}

function mostCommon(words, length) {
  const map = {}
  words.forEach(v => {
    for (let i = 0; i <= v.word.length - length; i++) {
      const part = v.word.substring(i, i + length)
      map[part] = (map[part] || 0) + 1
    }
  })

  return Object.keys(map).map(k => ({k, v: map[k]})).sort((a, b) => b.v - a.v).filter(o => o.v > 10000)
}

const CHAR_ENCODING = { a:0x00, b:0x01, c:0x02, d:0x03, e:0x04, f:0x05,g:0x06,h:0x07,i:0x08,j:0x09,k:0x0A,l:0x0B,m:0x0C,n:0x0D,
  o:0x0E,p:0x0F,q:0x10,r:0x11,s:0x12,t:0x13,u:0x14,v:0x15,w:0x16,x:0x17,y:0x18,z:0x19,"'":0x1A,'er': 0x1B,'in': 0x1C,'es':0x1D
}
const DELIMITER_ENCODING = 0x1E
const DELIMITER_WITH_ADDITIONAL_ENCODING = 0x1F
const ADDITIONAL_DATA_ENCODING = { ps: 0x01, s: 0x02, es: 0x04, ed: 0x08, ing: 0x10 }

function compress(words, keys) {
  // 8 arrays of 5bits (8 words) <=> 5 arrays of 8bits (uint8array)
  const chars = words.join(',')
  const SIZE = 5
  let high = 0x0
  let low = 0x0
  let buffer = Buffer.alloc(chars.length)
  let bufferPos = 0
  let bytesPos = 0
  let flushCount = 0

  function flush() {
    if (bytesPos == 4) {
      // move 20 bits from low word to high word
      high = low
      low = 0x0
    } else if (bytesPos == 8) {
      const bytes = new Uint8Array(5)
      bytes[0] = (high & 0xFF000) >> 12
      bytes[1] = (high & 0xFF0) >> 4
      bytes[2] = ((high & 0xF) << 4) | ((low & 0xF0000) >> 16)
      bytes[3] = (low & 0xFF00) >> 8
      bytes[4] = low & 0xFF
      for (let k = 0; k < 5; k++) {
        buffer.writeUInt8(bytes[k], bufferPos++)
      }
      bytesPos = 0
      flushCount++
      high = low = 0x0
    }
  }

  function write(what) {
    low = low << SIZE
    low = low | what
    bytesPos++
    flush()
  }

  for (let i = 0; i < words.length; i++) {
    const word = words[i].word
    // if (i % 100 == 0)
      // console.log('working on ', words[i], i)
    for (let j = 0; j < word.length; j++) {
      if (j < word.length - 1 && CHAR_ENCODING[word[j] + word[j+1]]) {
        write(CHAR_ENCODING[word[j] + word[j+1]])
        j++
      } else {
        write(CHAR_ENCODING[word[j]])
      }
    }
    const del = Object.keys(words[i]).filter(k => !!k && k != 'word')

    if (del.length > 0) {
      write(DELIMITER_WITH_ADDITIONAL_ENCODING)
      write(del.reduce((o, k) => o | ADDITIONAL_DATA_ENCODING[k], 0x0))
    } else {
      write(DELIMITER_ENCODING)
    }
  }
  const smallBuffer = Buffer.alloc(bufferPos)
  buffer.copy(smallBuffer, 0, 0, bufferPos)
  console.log('buffer length is', smallBuffer.length, 'flush count', flushCount, 'bufferPos', bufferPos)

  return smallBuffer
}

function isSuffix(word, suffix, map, counters) {
  if (word.length > suffix.length && word.indexOf(suffix) === word.length - suffix.length) {
    let pos = word.substring(0, word.length - suffix.length)
    // console.log('word', word, 'pos', pos, 'suffix', suffix)
    if (map[pos]) {
      counters[suffix] = (counters[suffix] || 0) + 1
      map[pos][suffix.replace("'", 'p')] = true
      return true
    } else if (pos.length > 2 && pos[pos.length - 1] === pos[pos.length - 2]) {
      pos = pos.substring(0, pos.length - 1)
      if (map[pos]) {
        counters[suffix] = (counters[suffix] || 0) + 1
        map[pos][suffix.replace("'", 'p')] = true
        return true
      }
    }
  }
}

function isPrefix(word, prefix, map, counters) {
  if (!map[word] && word.length > prefix.length && word.indexOf(prefix) === 0) {
    const pos = word.substring(prefix.length)
    if (map[pos]) {
      counters[prefix] = (counters[prefix] || 0) + 1
      map[pos][prefix] = true
      return true
    }
  }
}

function consolidate(words) {
  const map = {}
  const counters = {}
  const SUFFIXES = [ "'s", 'ed', 's', 'es', 'ing', 'ness', 'er' ]
  const PREFIXES = [ 'un', 'pro', 'pre', 're', 'in' ]

  words.forEach(word => {
    word = word.toLowerCase()
    try {
      let pos
      const suffixes = SUFFIXES.reduce((all, suf) => all || isSuffix(word, suf, map, counters), false)
      const prefixes = PREFIXES.reduce((all, pre) => all || isPrefix(word, pre, map, counters), false)

      if (!suffixes && !prefixes) {
        map[word] = {}
      }
    } catch(e) {
      console.log('error with', word, e);
      throw e
    }
  })

  const filtered = Object.keys(map)
      // .filter(w => w.length > 2)
      // .filter(w => w.length < 10)
      .map(w => w.replace(/[eiou]/g, 'a'))
      .map(w => w.substring(2, w.length > 4 ? w.length - 2 : w.length))

  const filteredMap = {}
  filtered.forEach(w => filteredMap[w] = map[w])

  return Object.keys(filteredMap)
      .map(k => Object.assign({word: k}, filteredMap[k]))
}

function permutations(words, letters, results) {

}

module.exports.mostCommon = mostCommon;
module.exports.compress = compress;

function run() {
  const fs = require('fs')
  const words = fs.readFileSync('./words.txt', {encoding:'utf8'}).split('\n')
  console.log('Size before', words.length)
  let wordsConsolidated = consolidate(words)
  console.log('Size after consolidating', wordsConsolidated.length)
  // console.log(mostCommon(wordsConsolidated, 1))
  // console.log(mostCommon(wordsConsolidated, 2))
  let numOf = 0
  const bloom = new BloomFilter(380 * 1000, numOf = 2)
  wordsConsolidated.forEach(w => bloom.add(w.word))

  const bloomArray = [].slice.call(bloom.buckets)
  fs.writeFileSync("data.txt", JSON.stringify({ arr: bloomArray }))

  const anotherBloom = new BloomFilter(JSON.parse(fs.readFileSync("data.txt")).arr, numOf)

  console.log(wordsConsolidated.reduce((count, w) => { count += (anotherBloom.test(w.word) ? 1 : 0); return count }, 0))

  // console.log(mostCommon(wordsConsolidated, 3))
  // fs.writeFileSync("compressed.bin", compress(bloomArray))
  // fs.writeFileSync("perm.txt", permutations(wordsConsolidated, 6, []))
}

function test() {
  const words = [ 'noam', 'shemesh', 'hello', 'world', 'shalom', 'olam' ]
  // console.log(mostCommon(words, 1))
  // console.log(mostCommon(words, 2))

}

run();
