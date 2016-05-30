// Anton Ivakin
Solution(solution.js):
-------------------
part I
	1. words with length > 15 -> invalid
	2. words with not "***'s" apostrophe -> invalid
	3. words with invalid 2chars combinations(in data file) -> invalid
	4. 1-3 length words, not presented in data -> invalid
	5. words with invalid templates(in data file) (look at code) -> invalid
	6. words with invalid 3char prefixes(in data file) -> invalid
	1-6 -> gives ~87% right answers for ~20% cases
	7. words with invalid 7 char prefixes(bloom filter -> in data file) -> invalid
	8. words from invalid words list(206 -> in data file) -> invalid

	*part I -> gives ~79.7% right answers
	**Source of data file generator attached(generator.js, it needs words.txt and badwords.txt(attached)).
	***I gzipped data file with 7z because it gives better compress ratio.
part II
	1. During tests save 'part I' valid words in memory.
	2. After 1500000 word -> every new word -> invalid. If this new word is valid due to 'part I' -> save it too.
	3. After 6000000 word -> stop saving new words. So every new word after 6M word is invalid.
-------------------
This solution gives result for:
0-1500000 words: ~79.7%
~2000000 words: ~80.4%
~2500000 words: ~81.6%
~3000000 words: ~82.7%
~3500000 words: ~83.8%
~4000000 words: ~84.7%
~4500000 words: ~85.4%
~5000000 words: ~86.1%
~5500000 words: ~86.7%
~6000000 words: ~87.1%
~6500000 words: ~87.5%
invinity -> 92.25%


P.S.
due to part II -> small solution(smallSolution.js attached) without data file, that gives result for:
~50000 words: ~57%
~100000 words: ~63%
~150000 words: ~67%
~2000000 words: ~71%
~2500000 words: ~74%
~3000000 words: ~76%
~3500000 words: ~78%
~4000000 words: ~79.7%
~4500000 words: ~80.9%
~5000000 words: ~81.8%
~5500000 words: ~82.7%
~6000000 words: ~83.3%
~6500000 words: ~84%
invinity -> 91.6%