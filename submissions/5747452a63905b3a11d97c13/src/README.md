# Hola challenge: word classifier

Made by [Antelle](https://github.com/antelle/) for [this challenge](https://github.com/hola/challenge_word_classifier).

## Disclaimer

We are solving a concrete task here, not inventing a new probabilistic data structure. A lot of heuristics, regexps,
non-reusable code, strange code, single engine targeted code, magic numbers, broken scripts, etc... inside.
If you are offended by this - just `cd ..`.

## Description

This classifier is using several techniques to achieve the result:

1. run the heuristic analysis and return the result if it has made any decision
  * the number of subsequent vowels/consonants must be reasonable
  * digraph frequencies must be distributed like in the dataset
  * the word must not contain too many digraphs with low frequencies
  * the number of vowels must be in the expected range
  * word length must not exceed the limit
  * the word must not match stop-word regexps
2. simplify the word using the regex list: replace common prefixes and suffixes
  * to adjust this list, use `prefixes` and `prefix-pairs` scripts, or English morphology knowledge
3. check if the simplified word starts with an existing trigraph, return false if it does not
4. test the word against the bloom filter

## The idea

The key data structure used for the classifier is the bloom filter.
If we put every word to it, we'll get the probability of 70%. So, we reduce the number of words used for hashing.
The less we put, the higher probability we get back. Several ways to compact the dictionary are used:

- common prefix groups folging (prefixes and suffixes which are used together, e.g. full-less, micro-macro and so on)
- plurals replacement (-'s, -es, -s, ...)

This way, we get the number of hashed words about 250..300k, instead of 660k, and the result is about 75%.
Additionally, to reduce the number of false positives, we detect non-English words heuristically:

- check digraphs distribution: a pronounceable word can not have a long sequence of low-frequency digraphs (like zq, qv, vc)
- find sequences of vowels and consonants (aeoaoa, bcvdfrw)
- repeating letters (bbvv)
- test against stopwords regexps (awesome results on apostrophe symbol)
- if word's starting digraph is not commonly used, test its starting trigraph against a special minimalistic bloom filter
- filter out extra long words

Applying these rules allows us to eliminate bloom filter requests for non-pronounceable words
and thus decrease the number of false positives. The overall result is now close to 80%.

Finally, we introduce false negatives: by transforming our filter into a counting bloom filter, 
we can test if a bit has been used for just one word or several words. If this bit often appears in the false set,
it is inverted and the bloom filter will give false negative answer instead, reducing false positives count.

With all of the optimizations above, total success rate is about 83.5%.

## Data file structure

1. 4+4+4+4 data lengths (uint32-le)
2. main bloom filter
3. first trigraphs bloom filter
4. digraph frequencies uint8 array
5. regexps

## Building

1. put words.txt to the project root
2. install deps: `npm i`
3. extract tests into `tests` folder (if you have the archive with tests)
4. download additional test sets with `download.js` (if you don't have the archive with tests)
5. generate error-words.txt with `get-error-set.js` script from another data folder; error set must contain about 5M words total.
    it's generated from a special folder tests/errorset; download it with `download.js` script as well;
    you can just [use my error-words.txt](https://drive.google.com/file/d/0Bys9IOCJSJrpeG5GREdMa19tQnc/view).
    note: after generating, throw out the error set and don't use it for tests
6. build the code with `node build`

Necessary output files: `out/solution.js` and `out/data.gz`.

After building you can run tests from json files located in subfolders of `tests` with `test.js`:

- `node test --folder=s2`: will run tests from tests/s2 folder
- `node test --dist`: will run tests using dist module
- `node test --chart`: will run tests and create average result chart in tmp

To build and run tests from predefined folders, use `build-test.sh` script.

## App components

- `module.js`: the module entry point
- `bloom-filter.js`: bloom filter
- `common.js`: heuristics
- `regexps.js`: replacement regexps, will be packed into data.gz

## Other scripts

- `build-dist.js`: build only js module, without data
- `test.js`: run tests
- `prefixes.js`: get most common prefixes, suffixes and substrings
- `prefix-pairs.js`: get most common prefix/suffix pairs/combinations which can be replaced with each other
- `download.js`: download some data files
- `get-error-set.js`: extract error set from downloaded dataset
- `test-heuristics.js`: check heuristics by error set and dataset
- `test-rule.js`: test a regexp rule
- `analyze.js`: some random analytics; only for building charts and getting used to the data
- `tune-param.js`: run build-test several times with sequential parameter increase; useful for finding optimal value

## License

WTFPL  
0. You just DO WHAT THE FUCK YOU WANT TO.
