# Solution

This solution occupies 65007 bytes and has an average accuracy of 69.5% when tested on a dataset of 200.000 words generated from the test generator. In the best case, it guessed 86 words correctly out of 100 words but unfortunately for the worst case it guessed just 51 words correctly out of the 100 words.

### So how do we do this?

Guessing true words is tougher as compared to guessing false words as we can use simple tricks to identify garbage. Also, after analysing the dataset thoroughly we realised that we could utilise some dataset specific tricks to identify the false words.

### Things were done:

1. Words which are not of valid length are eliminated. E.g.: A word of length 35 will be marked false.

2. A word in which an apostrophe occurs more than once will be marked false. Also, words which have the apostrophe at a position other than second last will be marked false.

 E.g.: a’a’k and a’ak will be marked false.

3. A word is marked false if it contains invalid consonants.

 E.g.: Supposedly there are only two 8 letter words in words.txt file. The 8 letter word are “precious” and “valuable”
The valid consonants for 8 letter words will be: [‘b’, ‘c’, ‘l’, ‘p’, ‘r’, ‘s’, ‘v’].
Now, the word generated for checking is “adorable”. The word will be marked false as ‘d’ consonant is not present in valid 8 letter consonants list.

4. If a word has an invalid prefix of 3-length will be marked false. Similarly, for words with the invalid suffix of 3-length and 4-length.
5. A word of length ‘l’,  having a suffix which cannot occur with words of length ‘l’ will be marked false.

 E.g.: Supposedly, suffix ‘ing’ occurs with words of length 9, 10, 11. 
Word generated for checking is ‘fing’. It will be marked as false as 4 length words cannot have ‘ing’ suffix.
Similarly, we have checked for prefixes.

### Fun Facts about dataset and test generator:

1. There are no words of length 35-44, 46-57, 59, 61 and above.
2. Test generator generates about 50% false words.
3. There are 140,415 words containing an apostrophe, out of which 99%  words end with an apostrophe and s-letter.
4. There are 299 4-length words which are formed by concatenating 2-length  words, apostrophe and s-letter.
5. Most generated words by test generator are of length 7-13.
6. All the words above length 9 contain vowels.
7. Test generator generates about 25%  words containing an apostrophe  for every test case.



### Alternatives tried:

* Change the encoding scheme and then apply gzip compression algorithm

 27 characters can be represented using 5-bits.
Every character is represented by 5 bits on an integer array. The array is saved on a file whose size comes out to be of 3.3 Mb. (The file used here is words.txt after doing following operations: lowercased, sorted, unique). File size after applying gzip is 2.2 Mb.

 Failed: gzip performed better.

* Use stemmer on dataset

 Applied snowball stemmer on unique.txt
stemmed_snowball file contains 281966 words unique words. Size of stemmed file is  2.6 Mb

 Failed: dataset contained abbreviations and words are not proper English words.
