The main idea is using Bloom filter with some heuristics.

Heuristics are simple (common digrams, sequential consonants, word length, few other quite oblivious things).

The result of using heuristics is 64% with small false negative mistakes rate. Then I excluded words with false negative result from dictionary, removed 's suffixes, cut words to 8 symbols and got dictionary of size 307064 words. I used it to prepare Bloom filter.

As a final solution, I use Bloom filter first and heuristics for positive results of filtering.