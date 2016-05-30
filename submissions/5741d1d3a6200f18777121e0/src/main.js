import BloomFilter from './bloomfilter'
import LancasterStemmer from './lancasterstemmer'

let bloom

export function init (data) {
  bloom = BloomFilter.deserialize(data)
}

export function test (word) {
  return bloom.test(LancasterStemmer.stem(word))
}
