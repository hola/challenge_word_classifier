# JS Challenge Spring 2016: Word Classifier

My submission for the Hola JS Challenge.

#### Wordforms
The key approach here was to utilize the master word list. For this I reduce words by taking out all vowels from them. E.g. _sour_, _sear_, _seer_ will all reduce to _s#r_. For convenience I call this a "wordform"

The wordforms are put in a separate file sorted by their frequency and I cram as many of them as I can into the program.

#### Other features
To supplement this I tried identifying additional features for a given word. These features were then run through AWS Machine Learning (as well as some good ol' brute forcing) to identify the useful ones and assigned weights. Stemming was applied to words using the Lancaster-Stemmer algorithm.

The features I ended up with in the end were:
- If the word was a wordform
- If the word contained an invalid two-letter combination
- The length of the word, based on frequency distribution.
- The longest recurring character sequence.
- If the word has a rare two-letter combination

Words fewer than five characters were also stored in the data file.

AWS ML helped identify some features that seemed promising but turned out to have no effect, e.g.
- The Scrabble score of the word (worth a try!)
- The number of consecutive vowels/consonants
- The length-to-syllable ratio
- If the word was made out of more than one wordform

#### Summary
Simulations indicate that my program has an accuracy of 60-69%.

- For the sample data generated, it was simpler to assign a negative value for long word lengths.
- There are a high number of false positives due to the "wordform" approach, and false negatives due to the length approach.
Looking at the words that the generator spits out though, a human would find it tough too! It was a fun experience and I can't wait to see what other people came up with.
