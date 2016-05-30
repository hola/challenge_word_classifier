WordTest 0.1
============
### Author: brstplayer
### Date: 14/05/2016 
---
The programm runs into two steps:

  1. it removes some prefixes and suffixes from a word, e.g. 'nonprivate' becomes 'private' and 'harmless' is transformed to 'harm';
  2. a reduced word is looked up against a dictionary implemented as a bloom filter.

The size of the dictionary is about 280.000 words, much smaller than the original. It was produced by deleting all words containing suffixes and prefixes that are removed in the step 1.