### ABSTRACT:

The solution is based upon a probabilistic data structure known as Bloom Filter. It is a data structure that answers membership queries in a set.

### STEPS:

1. Words of the form X's are present only if the word X is also present. Therefore we first need to remove them. The script reduce_count.js convert words to lowercase and removes X's words. This reduced the file size from 6.7MB to 5.1MB.

2. Now we group all unique words according to their lengths and sort them and store them in separate files such as 4.txt, 5.txt, 6.txt etc. (see grouping.js)

3. We now need to create Bloom Filters for all different lengths (see bloom.js). We set the false positive probabilities for each file and take the count of words as the number of elements for a bloom filter. We use only 1 hash function to keep the filter size minimum. The hash function returns 32-bit integers in radix-36 representation to reduce the file size further. The only catch is what probabilities are we setting for the false positive rate, that after gzip compression (see gzip.js) the data file size comes near to 63KiB (1 KiB left for the module).

4. When testing for words, the bloom filter is first loaded from the data file. If the word is of the form X's then we remove the 's from the word. Then we check the word length -
	for 1: return true
	for 2: out of possible 676 words 574 words are already present so we check for the other 102 words. If word is present in 102 words then return false (see index.js).
	for 3...32,34,45,58: Use the bloom filter for prediction.
	any other length: return false

### RESULT:

For 400 requests to the testcase generator (40000 words) the average accuracy for each testcase with (with constraint 64KiB for the data file):
1. Single bloom filter + 1 hash function (without length classification) : 55.98
2. Single bloom filter + 2 hash functions (without length classification): 61.23
3. Multiple bloom filters (according to word lengths) + 1 hash function  : 67.02
4. Multiple bloom filters (according to word lengths) + 2 hash functions : 65.89 