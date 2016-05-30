

There are two filters. First one uses some common properties of each
word, like number of vowels, consonants and the mean of the distribution
of vowels. This removes some noise. Second one uses top most frequent
5-letter prefixes to detect correct words. And it's packed into a prefix
tree with an encoding, that counts skipped zeroes before ones to achieve
better compression.


