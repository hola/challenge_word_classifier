# Hola JS Challenge Spring 2016: Word Classifier
- Includes (solution before minfiy, train.js, generate_testcase.js, test.js)
- generate_testcase.js: get 50 valid words from words.txt, then make it into wrong words
- train.js: create data.gz which is used in solution.js
# How did I solve this problems?
1. Firstly, I have found exception cases, such as:
- There are not so many words which end with q and j
- I have tried to list all possible 2-last-end-characters in english words and their their frequency. Then I have found all exception words from this
- The same idea with above but possible 2-begin-characters.
2. Secondly, I have used Bloom Filter with some changes from the origin bloom filter
- I have applied bloom filter with one hash function because I think with small available storage could make collision increase (more hash, more collision)
- But I have used 2 bloom filter with the same size with different hash functions (fnv_1a and b_crc32. I have choosen them after running a big testcase with many hash functions)