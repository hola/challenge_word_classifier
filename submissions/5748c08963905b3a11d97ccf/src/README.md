
This sources works with next algorithm:

1. Symbols are represented as integers 0..27 (5bit)
2. So it allows to pack almost all words (which <13) in uint64, (12 chars * 5bit = 60bit)
3. And we can consider dictionary (words.txt) as large logic function
4. So we can build large set of https://en.wikipedia.org/wiki/Conjunctive_normal_form which would be match words
5. This code trains set of CNF and pack to file 'data'
