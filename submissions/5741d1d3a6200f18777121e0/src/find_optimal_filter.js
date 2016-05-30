const fs = require('fs')
const zlib = require('zlib')
const uniq = require('uniq')

const BloomFilter = require('./bloomfilter')
const LancasterStemmer = require('./lancasterstemmer')

const data = fs.readFileSync('./input', 'utf8')

const words = uniq(data.split('\n')
  .map((word) => word.toLowerCase())
  .map(x => LancasterStemmer.stem(x)))

let bestResult = 0

for (var i = 1; i <= 4; i++) { // 1-4 bits
  for (var j = 1; j <= 12; j++) { // 1-12 hashes
    const bits = i;
    const hashes = j;
    const bloom = new BloomFilter(
      bits * words.length,
      hashes
    );

    words.forEach((word) => bloom.add(word));

    fs.writeFileSync('./data.gz', zlib.gzipSync(bloom.serialize(), { level: 9 }))

    let size = (fs.statSync('./data.gz').size + fs.statSync('./solution.js').size)

    if (size > 65536) {
      console.log(`${i} bits and ${j} hashes exceed 64KiB size limit`)
      continue
    }

    console.log(`Stats: ${JSON.stringify({
      words: words.length,
      bits,
      hashes,
      size
    })}`)

    let result = require('child_process').execFileSync('node', ['test.js', '.', './seeds'], {encoding: 'utf-8'})
    console.log(`Result: ${result}`)

    if (parseFloat(result) > bestResult) {
      bestResult = parseFloat(result)
      bestResultConfig = { bits, hashes }
    }
  }
}

console.log(`Best result: ${bestResult}%`)
console.log(`Best config: ${JSON.stringify(bestResultConfig)}`)

fs.unlinkSync('./data.gz')
