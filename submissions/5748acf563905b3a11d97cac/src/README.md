The idea
========
This solution uses an implementation of the algorithm described in [1] to
obtain a Bloom filter with an improved overall error ratio. The remaining space
is occupied by the top of a list of "spammy" n-grams (both positional and
non-positional) ordered by their contribution. The list is transformed into a
serialized trie for better compression.

1. The 17+ character words are discarded on the spot;
2. The word is checked against the spammy n-gram list, and if it doesn't
   contain any of these,
3. The word is split into n-grams and these are looked up in the filter.

References
==========
[1] Benoit Donnet et al., "Retouched Bloom Filters: Allowing Networked
Applications to Trade Off Selected False Positives Against False Negatives,"
2006

