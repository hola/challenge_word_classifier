## Analysis.

Analysis of the words and no-words revealed that:

1. Most of them ends in apostrophe "'s".
So  we can not just cut off part  of no-words, that have the other combination of letters after an apostrophe. And then consider the word before the apostrophe.
2. There are almost no normal words with double and more apostrophe in it.
3. Words with less than 2 letters in length - in most normal words.
4. The words consisting less than 2 different letters of different lengths - most normal words.
5. The majority of words consists to 15 letters. Thus it is possible to cut off most of the no-words.
6. Most similar words differ only in the end. The endings "ness", "ing", "ly" or "s". It is possible to neglect them when testing.
7. Most words have such characteristics:
	* No more than 2 identical letters in a row
 	* No more than 4 vowels in a row
 	* No more than 5 consonants in a row.
Also there was other statistics, but the result almost didn't change.


## Data

After numerous attempts and checks of different algorithms it became clear that some data are needed.
There have been tried many algorithms of compression of the dictionary, and as a result has led to a conclusion that in principle it is impossible to squeeze all words.
It was the maximum that succeeded to compress the dictionary with an accuracy of 93-95% up to 300-400 KB by means of a prefix binary tree.
Bloom filter also does not give good results. But it brought upon an interesting idea.
We have 65536 Bytes or 524288 bits. It is our actual limitations.
That if we calculate certain hash, and the resulting number will be used as an index to set the bit in the array of bits.
It turns out that we have 1 bit on the word. Of course hash can coincide. But nevertheless such table can eliminate some part of words. Thus data are created quite simply - for each of the words, we calculate an index of the word and we put bit by index in this bits array. The GZIP compression of the array so that there is about a ~1 KB  for a js code.
This method has allowed to increase efficiency of algorithm. The number of the words entering data can be reduced filtering each word on the restrictions described above. Obviously, the fewer words - the higher the probability of a correct response.
After selecting all the settings data size was reduced to 65433  that together with a code to keep within in 65536.
It almost hasn't influenced tests in any way. 


## Algorithm

The algorithm is aimed at rejection of no-words, with such intention that all normal words would undergo testing with the maximum accuracy.

1. Checking the apostrophe, if it is not the 's' after him - we return false.
2. If there is an apostrophe, we delete it and everything that is after him.
3. If word length less or the 2 that this word most likely normal is equal - we return true.
4. If word length more 15 that this word rather not normal - we return false.
5. If the word has less than 2 different letters, then we consider that this is normal word and we return true. It is used only for creation of the data.
6. The word is considered normal if it doesn't contain:
* more than 2 identical letters in a row
* more than 4 vowels in a row
* more than 5 consonants in a row.
7. Next, we cut the endings if it is "ness", "ing", "ly" or "s". It is picked up experimentally.
8. It has been also experimentally picked up that if to cut off the word on 8 letters, then it gives an additional gain.
9. We calculate hash and check on the table. If the bit is true, it means that our word is normal - we return true.


## Result

On my tests there were 79,7%.
On the test sample came out 79.2% of 1,000 units.
 


