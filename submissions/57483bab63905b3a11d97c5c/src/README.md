## About
- This is a description of my solution to the Hola's [Word Classifier challenge](https://github.com/hola/challenge_word_classifier)
- This solution should have accuracy in range: **82.8% - 82.9%** when evaluated on a substantional test set (50000 random testcases of 100-words each)

## Description
The main idea of the solution is to apply affix-stemming to the dictionary to make dictionary smaller in size to fit in the Bloom-filter. Additinal basic length and 3-Gram list was also applied. The main results:
- original dictionary of 630403 words was succesfully compressed to 218668 stems.
- For stemming was used original Porter Stemmer with my additinaly handcrafted affix stemming logic
- bloom filter of 61200 bytes was used to store 162000 major stems with error_rate of about 23.33%
- additinally 3-Gram filter was applyed (2197 bytes)
- simple filter of original and stemmed word length was applied
- javascript logic was minified and packed to the *extra_data.gz* to benefit from gzip-compression
 
### Solution files
This is a list of files that constitute a solution:
1. **solultion.js** - just a small unpacker and runner of extra_data
2. **extra_data.gz** - bundled classifier.js, 3-gram filter and bloom-filter
3. **src.tar.gz** - sources to reproduce this solution (way to build **extra_data.gz**)

### Source files
1. **solultion.js** - just a small unpacker and runner of extra_data
2. **PorterStemmer.js** - This is free and open [JavaScript version](http://tartarus.org/martin/PorterStemmer/js.txt)  of [Porter Stemmer Algorithm](http://www.tartarus.org/~martin/PorterStemmer)
3. **ApplyPorterStemmer.js** - JavaScript code, to apply Porter Stemmer to Training set
4. **classifier.js** - Classifier. The logic of classification algorithm. See details below.
5. **evaluate.js** - program to evaluate solution on cross-validation or test set
6. **test_script.js** - official test script used to for sanity tests
7. **BuildAll.sh** - Bash script to build and evaluate a solution from training set. Read it, it contains a lot of details
8. **BuildBloom.py** - Python code to build binary bloom filter from training set
9. **Hash.py** - Python Hash function implementation. The same function is implemented in JavaScript in **classifier.js**.
10. **Compress3Grams.py** - Python code to build binary 3-Gram filter.
11. **Distribution3Grams.py** - Java code to calculate 3-Gram statistics.
12. **BuildStemStats.py** - Java code to calculate 3-Gram statistics.
 
### How to build
To build **extra_data.gz** from sources you need to read **BuildAll.sh**, prepare Training and Cross-validation set, and run:
```sh
$ ./BuildAll.sh
```

### Training set
To reproduce solution you need to prepare the Training Set. I used a training set consisted from 291920912 training example (words, that are either positive or negative regarding the classification problem). You need to split and aggredate your training examples to the two files:
1. **dataset.3.pos** - a number of each distinct positive example in training set
2. **dataset.3.neg** - a number of each distinct negative example in training set

#### Training set example **dataset.3.pos**
Example of first 5 lines from my **dataset.3.pos**:
```
946 mw
932 ph
915 ods
905 cs
904 ma
```
#### Training set example **dataset.3.neg**
Example of first 5 lines from my **dataset.3.neg**:
```
37839 '
31540 ove
31349 nons
31293 gly
25829 ces
```

Note, that each file consist of the list of **distinct** positive or negative examples. So the **dataset.3.neg** contains much more lines that **dataset.3.pos**. All lines in this files are also sorted by first column desceding.


