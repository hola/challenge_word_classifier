# Principle of operation
1. In the original dictionary (6.7Mb), I had calculated ratio of vowels to consonants ( "vocal_instance" variable).
So, the "vocal_percent" function calculates the same ratio of incoming word, and we could compare it with "vocal_instance".
2. Three regular expressions are checking the relevant parts of the word.
The module has 3 dictionaries:
  - Prefixes Dictionary
  - Roots Dictionary
  - Endings Dictionary
3. "rating" function checks the words on regular expressions, calculates "vocal_percent" and discovers repeating roots in the word (regular expression "rootRegRepeat"). Results obtained by comparison with the sum of the weights of each of these terms. The weights were obtained experimentally.
