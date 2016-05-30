Script uses 3 checks.
* _Trie from words converted to binary._ Sort letters from words.txt by
* popularity. Replace odd places with '1', even places with '0'. Build trie with
* _[(word.length - 6).toString(2) + convertToBits(word)]_ values.
* _Bloom Filter._ Truncate all words to 5 chars. Build bloom filter with one
* hash.
* _Unpopular/unused chars combinations_.

How to get data.gz
1. Put words.txt and script.rb in same directory.
2. Run script.rb. 'tree.bin' and 'hashes.bin' files will be generated.
3. Run 'cat tree.bin hashes.bin > data'
4. Pack 'data' file with 7-Zip

