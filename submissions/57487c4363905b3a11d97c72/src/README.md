## The Idea
Started from *trie* but eventually landed with *bloom filter*, this solution combines multiple bloom filters basing on partial features(eg: prefix, suffix, vowels) of the given dictionary set and general non-word regex filters.
<br>
Four partial bloom filters and a few regex filters are adapted in the final submission. Including:
- Bloom filter for first 6 letters of each word with `m = 380,000` and `k = 1`.
- Bloom filter for 8th onwards letters of each word with `m = 130,000` and `k = 2`.
- Bloom filter for 3 or more continuous vowels in each word with `m = 1,000` and `k = 1`.
- Bloom filter for 4 or more continuous consonants in each word with `m = 10,000` and `k = 1`.
- Bloom filter for words less than 5 letters with `m = 20,000` and `k = 1`.
- Bloom filter for suffix of words more than 12 letters with `m = 8,000` and `k = 1`.
- Regex to filter out words containing more than 5 continuous consonants (this brings in false negative). Regex: `[bcdfghjklmnpqrstvwxyz]{6,}`
- Regex to filter out words containing apostrophe but not ending with `'s, 'd, 't`. Regex: `'[sdt]$`
- Regex to filter our words longer than 19 letters. Regex: `^.{20,}$`
- Regex to filter out words that contains more than 5 continuous consonants. Regex:  `[bcdfghjklmnpqrstvwxyz]{6,}`

## Local performance
### 79.23%
Tested with the first 10,000 json files from [hola testcases](https://hola.org/challenges/word_classifier/testcase).

## Structure
### __Java package__
As I'm not familiar with Node.js. I started with Java for POC and logistics.
- Base bloom filter & regex filter implementations.
- Multi-thread tester to combine various filters with carefully selected parameters, aiming to achieve max accuracy with minimal space usage.
- To generate the `data.gz` file.

### JS Classifier
A JS version implementation of above ideas. With Minification done by [JavaScript Minifier](http://javascript-minifier.com/).
I've attached the un-minified script attached.
### data.gz
__0-380,000bit__: Bitmap for prefix bloom filter.
<br>
__380,001-510,000bit__: Bitmap for suffix bloom filter.
<br>
__510,001-511,000bit__: Bitmap for 3+ continuous vowels.
<br>
__511,001-521,000bit__: Bitmap for 4+ continuous consonants.
<br>
__521,001-541,000bit__: Bitmap for word with less than 5 letters.
<br>
__541,001-549,000bit__: Bitmap for suffix of words more than 12 letters.

## Worth mentioning
Also, I created my own hash function basing on the well-known `djb2` algorithm. The base and multiplier are selected by the Java tester.
