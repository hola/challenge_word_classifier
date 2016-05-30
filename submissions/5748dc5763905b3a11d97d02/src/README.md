__JS Challenge Spring 2016: Word Classifier__

This solution demonstrates best results on large test sets by gathering statistics at runtime.

- 1.000 blocks (100.000 words): 80.5 %
- 2.000 blocks (200.000 words): 80.58 %
- 5.000 blocks (500.000 words): 81.7 %
- 10.000 blocks (1.000.000 words): 81.73 %
- 20.000 blocks (2.000.000 words): 84.7 %
- 50.000 blocks (5.000.000 words): 87.7 %
- 100.000 blocks (10.000.000 words): 88.59 %
- 200.000 blocks (20.000.000 words): 89.42 %

__`test` function:__

1. If a word ends with `'s` then remove this ending and check the rest part of the word.
2. If a word contains `'` then return `false` (there are too few words with `'` in the dictionary except those with `'s` at the end).
3. If the length of the word is `1` or `2` then return `true` (almost all of them are in list).
4. If the length is greater than `16` then return `false`.
5. Then a simplified and improved version of Porter's stemmer is applied to the word (described further).
6. A lookup is performed in a Bloom filter. `False` is returned if the stem is not found.
7. At this step, there are many false positives left. We should try to decrease their quantity.
8. If a word was already tested before then it's more probably contained in the dictionary.
9. All stems at this step would be remembered in a map called `visited`. Each stem would be mapped to the quantity of times it was tested before.
10. Slight heuristic: if a visited word is in list of prefixes (described further) then return `false` (false positive stems like `non` or `over` are met here quite often).
11. True positives list is finite, so we meet new words twice too rarely if a program is running long. And false positives are met twice regularily. Take a look at statistical data further.
12. If the word is met twice then return `true` if and only if we have tested not more than 2.500.000 words.
13. If the word is met thrice then return `true` if and only if we have tested not more than 4.500.000 words.
14. If the word is met four times then return `true` if and only if we have tested not more than 6.000.000 words.
15. If the word is met five times then return `true` if and only if we have tested not more than 7.000.000 words.
16. If the word is met more than five times then return `true`.
17. The rest part of this algorithm assumes that the stem is tested for the first time.
18. If we have tested more than 425.245 words then return `false` (it means that almost all dictionary words were visited and all new words are fake).
19. If the length of the word is greater than `13` then return `false` (note that a word at this step is a stem of original word).
20. If a word contains five or more consecutive vowels or consonants then return `false` (it's likely to be artificial, e. g. `qazzzzzarema`).
21. If a word has two or more sequences of vowels or consonants of length `4` then return `false` (e. g. `qwrtaetrtr`).
22. If a word has three or more sequences of vowels or consonants of length `3` and `4` then return `false` (e. g. `qwraetrtreau`).
23. If a word has five or more sequences of vowels or consonants of length `2`, `3` and `4` then return `false` (e. g. `qwraetrtreauzx`).
24. Then a Porter's stemmer `m` function is calculated for a word (described further).
25. If its value is `0` or greater than `5` then return `false`. Words from the dictionary mostly have value of `m` function between `1` and `5` inclusive.
26. A letter `q` almost always stands before `u`. It lets us filter out artificial words which contain `q` before other letters. There do exist some other frequent sequences.
These sequences were found by comparing dictionary and fake lists. A corresponding regular expression was generated (class `LongLiving` from sources). If a word suits this expression, `false` is returned.
27. Return `true`.

__Statistical data for the step 11:__

Quantity of new words visited 2 times:

    False: 0:7896, 300000:8263, 600000:7611, 900000:6962, 1200000:6356, 1500000:6115, 1800000:5904, 2100000:5730, 2400000:5468, 2700000:5597, 3000000:5477, 3300000:5286, 3600000:5270, 3900000:5147, 4200000:5107, 4500000:5181, 4800000:5235, 5100000:5287, 5400000:5190, 5700000:5301, 6000000:5273, 6300000:5234, 6600000:4835
    True: 0:47117, 300000:51423, 600000:39071, 900000:28161, 1200000:20870, 1500000:15173, 1800000:11346, 2100000:8289, 2400000:6384, 2700000:4793, 3000000:3576, 3300000:2696, 3600000:2009, 3900000:1526, 4200000:1152, 4500000:892, 4800000:686, 5100000:512, 5400000:352, 5700000:264, 6000000:188, 6300000:147, 6600000:114

Format of `600000:7611` means that there were met `7611` words twice while testing words from `600000` to `900000`.
So, we can see that fake words are constantly met during the execution of program while real words are met often in the beginning and finish appearing at the end because their list is finite and new real words cannot be generated.
This detail lets us return `false` after 2.500.000 processed words as the new duplicates are more probably fake than real.

Quantity of new words visited 3 times:

    False: 0:3499, 300000:4789, 600000:4718, 900000:4395, 1200000:4061, 1500000:3751, 1800000:3636, 2100000:3477, 2400000:3353, 2700000:3123, 3000000:3039, 3300000:2963, 3600000:2800, 3900000:2892, 4200000:2733, 4500000:2693, 4800000:2693, 5100000:2601, 5400000:2699, 5700000:2752, 6000000:2701, 6300000:2721, 6600000:2411
    True: 0:19088, 300000:34149, 600000:34550, 900000:29825, 1200000:25142, 1500000:20093, 1800000:16520, 2100000:13206, 2400000:10797, 2700000:8655, 3000000:7075, 3300000:5654, 3600000:4623, 3900000:3822, 4200000:3050, 4500000:2364, 4800000:1907, 5100000:1449, 5400000:1134, 5700000:912, 6000000:733, 6300000:558, 6600000:379

If we meet a word third time, the situation is the same but the shift differs: we may return `false` after 4.500.000 words.

Quantity of new words visited 4 times:

    False: 0:1978, 300000:3168, 600000:3385, 900000:3336, 1200000:3207, 1500000:2891, 1800000:2932, 2100000:2749, 2400000:2587, 2700000:2431, 3000000:2279, 3300000:2229, 3600000:2120, 3900000:2005, 4200000:1975, 4500000:1950, 4800000:1994, 5100000:1923, 5400000:1851, 5700000:1790, 6000000:1810, 6300000:1928, 6600000:1712
    True: 0:8959, 300000:20379, 600000:25620, 900000:26074, 1200000:23941, 1500000:21453, 1800000:18439, 2100000:15722, 2400000:13642, 2700000:11485, 3000000:10001, 3300000:8428, 3600000:7303, 3900000:6102, 4200000:5346, 4500000:4380, 4800000:3755, 5100000:3062, 5400000:2538, 5700000:2081, 6000000:1678, 6300000:1332, 6600000:1025

The same goes for words tested 4 and 5 times before. Further improvement is insignificant and can be achieved only on sets with more than 7.000.000 words which are unlikely to be used.

__`init` function:__

1. File `solution.js` contains just an `exports` clause for `init` method. The method reads source code from `data` buffer until `ET` sequence is met and then `eval`s it.
2. The source code from `data.gz` continues reading buffer line by line. It stops reading when an empty line is met.
3. The first list of lines is a list of suffixes used in simplified version of Porter's stemmer.
4. The second list is a list of prefixes used as an improvement of Porter's stemmer. This list is also used in step 10 of `test` function.
5. Then goes binary data of a Bloom filter used in step 6 of `test` function.

__`cutStem` function:__

Porter's stemmer turned out to show good results for this task despite it was developed for other purposes. Simple cutting of predefined suffixes and prefixes produces results that are 5-10 % worse.
Even when the list of suffixes is the same as used in stemmer. The resulting list of stems may be almost the same size as Porter's stemmer produces. It may be much smaller or may be almost equal to the original dictionary.
But the Bloom filter filled by this list produces worse results than the filter with stems generated by Porter's stemmer.

The main point is the function `m` defined in [stemmer's algorithm](http://snowball.tartarus.org/algorithms/porter/stemmer.html).

A sequence of vowels is written as `V`, a sequence of consonants - as `C`. Each word has a form of `[C](VC){m}[V]`. So, `m` shows how many times a sequence of vowels is interchanged with a sequence of consonants.
And the Porter's stemmer restricts cutting a suffix if `m` is lower than 2. Taking into account this restriction, we may simplify Porter's stemmer source code (a standalone Java version has 600 lines) to just cutting a predefined list of suffixes and checking `m`.

1. A longest suffix is looked up in a list of predefined suffixes.
2. If the suffix is `ed` or `ing` or starts with one of `abl*`, `ibl*`, `iz*`, `is*` or `at*` then the removal of double consonant would be required. Example: for the words `stopped` and `stoppable`, suffixes `ed` and `able` would be found. After cutting, we get stem `stopp` and should remove a duplicating consonant at the end.
3. The definition of double consonants that may need removal is taken from [__Porter2__ algorithm](http://snowball.tartarus.org/algorithms/english/stemmer.html) (a revised version of original Porter's algorithm). Those are `b, d, f, g, m, n, p, r, t`. Also, `l` is added here for simplicity (Porter's stemmer deals with it separately).
4. `m` function is calculated for a potential stem. If it is less than 2, the suffix won't be cut. Exclusions (which were added heuristically) are `s`, `ful` and `less`. They may be cut with `m` equal to 1.
5. The suffix is cut and a shortened word is checked again. For instance, the word `helplessness` would be processed twice: suffixes `ness` and `less` would be cut sequentially. The resulting stem is `help`.
6. Suffix `s` is checked only at first iteration.
7. Suffixes list was gained manually by deducing rules from Porter's stemmer description. For example, rule `Y -> I` of step 1c may be continued by rule `ELI -> E` of step 2 which leads to rule `ATIVE -> ` of step 3. So, the word `formatively` would be transformed into `formativeli`, then to the word `formative` and finally to the stem `form`. A simplified list of suffixes contains `ative` and `ly`. For some situations the list becomes verbose (e. g. it contains `isable, isabling, isation, izable, izabling, ization` - a cross-product of original rules) but its verbosity lets to keep the source code small and simple.
8. Some extra suffixes were added manually (like `less`).
9. After suffixes are cut, the same goes for prefixes but even simpler.
10. Prefixes are cut if `m > 1` without any exclusions.
11. The list of prefixes was initially collected manually and then was reduced threefold by a greedy randomized algorithm (if the results without a random prefix are better then remove it from list).

__Development and testing:__

The development set of words consists of 5.000 blocks with seeds chosen randomly from 64 bit integer range. Test set contains 100.000 blocks. Validation set also contains 100.000 blocks.

Each launch of a program shows statistics with min, max, average, average - standard deviation, average + standard deviation and sum values. Also, the quantity of false positives and false negatives is printed.

These values are rows of an output table. And columns are previous or alternative versions of program. So, it's possible to compare the resulting program with algorithms like `always true`, `simple random` and `Porter's stemmer + Bloom filter`. Sample output for 500.000 words:

     max:     69,     69,     66,    100,    100,     85,     88,     91,     77,     77,     77
    high:     53,     54,     54,    100,     94,     74,     78,     81,     64,     64,     64
     avg:     49,     50,     49,    100,     92,     70,     74,     77,     60,     60,     60 <- Result
     low:     45,     46,     44,    100,     90,     66,     70,     73,     56,     56,     56
     min:     31,     31,     31,    100,     82,     53,     59,     62,     42,     42,     42
     sum: 249990, 250010, 249904, 500000, 464998, 354336, 374473, 389148, 302220, 302222, 302221
      fp: 250010,      0, 125182,      0,  31451, 142173, 121973, 107311, 194304, 194293, 194304
      fn:      0, 249990, 124914,      0,   3551,   3491,   3554,   3541,   3476,   3485,   3475
               A       A       R       P       S       C       B       C       S       S       F
               L       L       A       E       T       U       L       U       T       T       I
               W       W       N       R       E       T       O       T       A       A       L
               A       A       D       F       M               O       _       T       T       T
               Y       Y       O       E       M               M       B       S       S       E
               S       S       M       C       E                       L       _       _       R
               _       _               T       D                       O       R       D       E
               T       F                                               O       A       E       D
               R       A                                               M       N       T        
               U       L                                                       D                
               E       S                                                                        
                       E                                                                        

The development was performed in Java. Final NodeJS version is a port. Original source files contain much unused code of researching and previous attempts, so it's hard to find sense there. Unfortunately, I didn't have enough time to clean it up.

__Folder structure:__

- DAWG - a project that was used in research. A Java implementation of directed acyclic word graph. It wasn't efficient enough to be used for compression but was useful for situations when both prefix- and suffix-searches are needed.
- HolaTests - test data sets downloader.
- Hola - a main project that contains class Solver which performs results calculation and some classes for researching purposes.
- JeneticsTest - an attempt to find a perfect set of prefixes by genetic algorithms. Failed (it works but cannot find anything interesting in reasonable time).
- NodeJS - final port to NodeJS with scripts for launching and concatenation of a javascript file with Bloom filter binary data.