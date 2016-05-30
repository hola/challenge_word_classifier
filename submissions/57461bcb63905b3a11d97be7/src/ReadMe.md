# Main ideas

Main ideas of solution:

  1. Shortening of the initial set of words.
  2. Bloom filter.
  3. Additional analysis of the test word.
  4. Statistical analysis of the test words.

## Shortening of the initial set of words

Large original dictionary can be shortened by several times, if remove the word's suffixes and prefixes. This should have a positive impact on the work of any algorithm.

## Bloom filter

Bloom filter has been selected as a basis for solving. The size and parameters of the hash functions were chosen programmatically.

## Additional analysis of the test word

The aim of the analysis was to reduce the false-positive actuations Bloom filter. Word analysis has shown that these characteristic are not typical for initial set of words:

 * More than four consecutive consonants in a word.
 * The word ends in "'", "i", "j", "q" or "y" after removal of suffixes.
 * The word starts with "x" after removing the prefix.
 * The word is empty after removal of prefixes and suffixes.

This analysis excludes a number of words, but the filtration efficiency of non-words increases stronger.

## Statistical analysis of the test words

In the problem statement says, that each of the test words belongs to one of the two sets:

 * Fixed set of words.
 * Infinite set of non-words.

Based on this, it is possible to construct the analysis of frequency of occurrence of test words. That can determine the affiliation of the test word to one of the sets.

