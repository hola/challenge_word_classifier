# Hola Word Classifier Challenge

The idea of the approach is to take advantage of the [letter frequency](https://en.wikipedia.org/wiki/Letter_frequency) in the English language and then use prefix trees that only look on the characters in the list, ignoring all other characters in the list.

To achieve higher compression rate generated prefix trees are serialized into bitmask trees with minimal dictionaries. This allows to also benefit (to some degree) from regular gzip compression.

This approach also scales quite well and yields as the size of the dictionary grows. 
