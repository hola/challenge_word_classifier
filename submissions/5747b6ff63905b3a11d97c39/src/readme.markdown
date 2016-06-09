Script uses 3 checks:
* Binary trie (Avg correctness 61-62%)
1)Sort chars from words.txt by popularity.
2) Replace chars in 'words.txt' using following table.
Chars sorted by popularity: q j x z w v k f y b g ' h p m d u c l t r o n i a s e
Replace by:                 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1
3) Put [length + bin-word] to trie.

* Bloom Filter (Avg correctness 69-70%)
1) Truncate all words to 5 chars.
2) Build bloom filter with one hash.

* Reject unpopular/unused chars combinations (Avg correctness 57-58%)
Some chars combinations that I noticed.



How to get data.gz
1. Put words.txt and script.rb in same directory.
2. Run script.rb. 'tree.bin' and 'hashes.bin' files will be generated.
3. Run 'cat tree.bin hashes.bin > data'
4. Pack 'data' file with 7-Zip

