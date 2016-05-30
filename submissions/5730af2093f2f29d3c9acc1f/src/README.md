
README
======

Name : Gilly Barr  
Phone # : 054-5623450  
Email : gillyb@gmail.com


Hello :)
This came out to be a little long in the end, please bare with me...


My approach to solve the word classifier is like so :
--
First, I created a list of all the possible 3 letter permutations in the alphabet.
There are around 17k permutations like this. Then I went through all the words in
the dictionary and counted how many times each permutation is found.
This gave me a score of how 'popular' each permutation is in the dictionary.

The logic behind this is that if I have a 'popularity' score for each permutation,
then looking at a given word (whether real or not), I can split it into parts of 3 
letters each, and then I should be able to calculate a score for that word relying
on the popularity scores of the different parts of the given word.

I normalized all the scores to give me a value between 1-100. The score of '0' I 
reserved for certain permutations that don't exist in the dictionary (There are a
few thousand of these). If I run into a given word that has a letter combination
with a score of '0' I could immediately identify this word as a 'fake'.

I saved around 6k test words (given from the 'testcase' endpoint) to create my average
expected score. Since words of different lengths will obviously give me different
scores of different magnitudes, I split the 'average expected score' into different
groups based on the length of the word.
I built 'expected averages' of the score of words by different lengths.
(This is the object called `scores` in the `test` method.)

In addition to this, I also tried scanning the dictionary and the testcase endpoint
looking for specific hueristics that will easily invalidate a group of words.
The only conclusions I came to were that if a word has an apostraphe in it, but 
doesn't end in '\'s' (apostraphe s) then it's most likely not a word (there are very
few of these in the dictionary).
Another conclusion was that I never saw words in the testcase endpoint longer than 22
characters that were in the dictionary.



Files :
--
* The code itself is in the file called `word_classifier.js`
* The data file I supply is an object of all the permutations, and their normalized
popularity score. This is gzipped and saved as the file `compressed_data`
* The code I used to generate the test data is in the file `data_generation.js`
* The file `tester.js` is just a script I created that I used to test my word
classifier while developing.



Accuracy :
--
In the beginning, my goal was to reach 80% correctness...
Unfortunately, I didn't get that close (yet!).
I called the testcase endpoint a few times and collected ~6k words to test against.
Using my script (`tester.js`) I managed to get to an accuracy of 63%.
(Obviously this doesn't mean anything regarding the accuracy you will find when testing,
since I believe you'll probably test more words, and a different set of words. It may be
more or less.)

I added the 'yet' since I'm currently in Berlin (flew with my wife) and wanted to send in
my initial attempt.
Hopefully I'll have time to continue adjusting the algorithm when I get back and resend it.
I believe that if I add a factor to the normalization, and properly callibrate it, It will
help a lot. Like so, I also want to callibrate the factor I use to check if the calculated
score is close enough to the 'expeceted score'.
(These are 2 factors I can play a lot with, and add complexity to the way I calculate them)