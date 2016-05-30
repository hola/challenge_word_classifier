Bloom filter is the heart of the algorithm.
But not for whole words but by ngramms: the word broken into pieces on a fixed pattern, and these parts are used to create the filter.
Also, the algorithm keeps track of the input words and frequent duplicate ones considers as dictionary words. Since the dictionary is limited, and sooner or later, the words begin to repeat more often, as opposed to non-words. But this method begins to contribute later (significantly) than the start of testing.
The solution itself is the result of exhaustive search, which went through seed for the hash function, filter sizes, options for ngramms patterns and lists of common prefixes and suffixes, and so forth. Then I select the best solution, which after compression fits in 65536 bytes.

Features:
-most part of the code resides in additional data and compressed with gzip, the main code simply runs it through the eval
-bit array of bloom filter is translated into a character representation (8 bits per character) (this representation has better compression)
-also character representation of bloom filter is further compressed by the LZMA algorithm (even taking into account the size of the code to decompress, the result saves about 2 kb compared with gzip compression)

Heuristics:
-remove frequent suffixes and prefixes (before training and before testing)
-words with the length less than 3, reports as true
-words with the length more than 17, reports as false
-words that have an apostrophe, except those that end with 's, reports as false
-check for rare pairs of symbols (142 pairs)