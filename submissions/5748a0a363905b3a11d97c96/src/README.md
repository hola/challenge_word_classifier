RULES: https://github.com/hola/challenge_word_classifier

# Methods

Three main steps are used and the overlap between them is minimized.
Most of the work was done in C# and only translated to JS when interesting 
results were found.

Here's the steps:

A. some euristics to exclude common errors
B. rare substring exlusion on the word.substr(9)
C. a retouched bloom filter on word.substr(0, 7)

Each step exclude false negatives from the previous steps when building their data.

# A. Euristics

Some euristics are used to weed out common patterns in false words:

- Exclude if word.length > 17
- Remove trailing " 's " from the word
- Exclude words that contains a " ' " character 
  (after removing trailing " 's " it gives few false negatives)
- Exclude words that match "[^aeyuio]{5}" or [fghjkqvwxyz]{3}

## B. Exclusion of less frequent substrings (sample exclusion)

Work on the substr(S) of the words (skip the S first characters, to avoid overlap with the bloom filter).
Compute every possible substring of size N and store a list of the ones 
that appears less then X times in the dictionary.

When testing, exlude any word that match one of the stored substrings.

Note: I use a character to anchor the end of the word before sampling it (hello => hello$)

(Provided solution use N = 3, X = 46, S = 9)

## C. Bloom filter

Use a bloom filter of size M, with K hash functions.
Apply the bloom filter on the subtr(0, S) of the words (truncate the words at size S).
Retouch the bloom filter with the X most frequent false positives.
The bigger the test sample, the better it will reflect an average 
test block, I used 100.000 blocks (10.000.000 words) to build my most common false positives list.

I also prevent retouching any bit that have too much weight (hit by more than Y words from the
dictionnary).

Given that I use a big K, I can select which bit to reset when retouching for a false
positive. I select the bit with the less weight.

I also reset all matching bits of weight one, given that by resetting a bit, we create
false negatives, there is not point in keeping the other bits of the false nagatives we
have created.

NOTE: 
In this challenge we do not optimize for a fixed size M, we optimize for the compressed size
of M. That's why a rather big K is used, it gives a slightly better compressed size / results ratio.
The downside of a big K is the CPU/memory cost when building/retouching the filter, and zopfli (gzip compression)
having a bigger file to process. Given more resources (I just used my laptop), more parameters
could be tested more quickly, maybe a genetic algorythm could be used to find maximas.

(Provided solution use M = 175720 * 8, K = 15, S = 7, X = 2000, Y = 9)

# Storage

I store data from the B method in text format and use a little trick to help compression:
given that the order do not matter and that the substrings are constant lenght, 
I order the substrings and use some kind of delta compresssion:

If I need to store:

aaa
aab
aac
abb

I write:

aaa
b
c
bb

The final format of my data file is the concatenation of:
- the data for method B
- the data from the bloom filter (method C)
- the javascript that contains (minimized with closure compiler):
    - the bloom filter lib
    - my init/test functions (see js/index.js)

All that data is gzipped using zopfli (mostly useful for the JS part).
My entry point file just call eval on a slice of the buffer to start the real script.

# Expected result

I get a score of 81.61 (std. dev. 3.87) across 100.000 blocks (10.000.000 words).

# Notes

I believe that just by tuning my parameters a better score is achievable, given that I only
tried to change parameters by hand I think I only found a local minima.

I use a test_results.csv file to input parameters and 
start bin/HolaGen.exe to fill in the results for each row that do not contains results.
The exe use PLINQ to use every core possible (process 8 rows in parallel in my case).

I used an excel spreadsheet linked to the csv file to have a nice global view of my results.

# Credits

[jasondavies](https://github.com/jasondavies/) for [bloomfilter.js](https://github.com/jasondavies/bloomfilter.js)


# Remarks

About the challenge promotion: I think the russian page which allow comments is a lot 
better for motivation than the english github page. I would probably have stopped a lot
sooner if I didn't go to the russian page and used google translation on the comments
to have an idea of what was achievable.

