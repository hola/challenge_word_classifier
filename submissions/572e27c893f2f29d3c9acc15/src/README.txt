Hi,
My name is Aviram Fireberger, I'm a software engineer.

In this ReadMe file I will explain my solution for this "SpeelChecker" challenge.
My Solution is based on couple of algorithm and basic sanity test combined together.


The First Algorithm: 
Bitmap of 8 length substring and words shorten then 8 chars. **(will explain in the end why I choose 8)
I used a 580,000 byte array as my Bitmap, **(will explain in the end how I ended with 580,000)
First of all I converted the whole dictionary (words.txt file) to lowercase chars.
Then I wrote a small program in C# (source code is attached), that reads all words from the file and save it as strings objects (will refer this list as a "DictionaryList").
I save in another list all words that their length is 8 or shorter.
In addition to that, I added to that list all the 8 length substring of each word from the "DictionaryList".
e.g :
"liselotte's" will be save as those 4 strings: "liselott" , "iselotte" , "selotte'" and "elotte's"
All of those words (8 length or lower) will be saved in the "8CharsHasingList".
Now for the hashing,
For each word in the "8CharsHasingList" I calculate a hash value from 0 to 580,000 (Bitmap size)
By using 2 primary numbers 17 and 19 **(will explain in the end how I ended with 17 and 19)
Then I put 1\True value in that position in the bit array.


The Second Algorithm:
Bitmap of 3 length string for all the permutation that ARE NOT in any word.
I used a 19,684 byte array as my Bitmap, **("abcdefghijklmnopqrstuvwxyz'" --> 27 chars) all permutation available are 27^3 = 27*27*27 = 19,684
I collected to a new list all the 3 length substring of each word from the "DictionaryList".
Then created a NEGATIVE dictionary using that list and whole 3 chars permutations list.
That dictionary also contains the order of the word in all 3 chars permutations
e.g. "aaa" will have the value 1, and "aad"=4 and so on.
(I decided to go for the negative dictionary because the negative will contains less words\Bits and  it is better for compression from the tests that I run).
The positive is 12,171 and negative 8,112 (e.g. you won't find "aaj"=10 in any word)
I filled the second bitmap with those location.

The Third Algorithm:
kind of same algorithm 2, But this time I getting all words in length "1" and all subsring in length 2 that are not in the full dictionary.
This is the list that I got:
negativeTwoOrOneCharsArr = ["'","jq","jx","jz","qj","qx","qz","vq","xj","zx","'j","'q","'x","'z","''"];
When checking a word, I'm taking all the straight substring of length 2, if one of them in this list... Its not an English word.


Sanity check:
The longest word in the dictionary is 22 chars. so of course each word longer then that is a "non-English" word.

The Data File:
I concatenating both Bitmaps (580000 & 20000) and saved it to a file,
Then GZiped it to a size of 62,137 Bytes.


How I got all the numbers (8 length chars, 580000 size of bitmap , 17 and 19 number for the hashing functions):
I used the word generator URL to collect a True-Set of 5000 words.
Took a collection of the first 20 primary numbers:
int[] prime = {2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71}; 
I run 3 loops ,
First one for Bitmap size from 200,000 to 1,300,000 - each time adding 10,000 bytes.
Second for the first hash primary number (1-20)
Third for the second hash primary number (1-20)
For each combination I run those algorithms, and check that the size of the final compressed data is not bigger then 64,000 bytes.
In addition to that I run the true set each time for SAVING the best result that could achieve by the final data file.
So that's about 110*20*20 = 44,000 loops ---> ABOUT 12+- Hours of CPU processing. 
Also run couple of test with different substring length.
The best result was with those number combinations, getting approximately 77.65% success.


The JavaScript Module:
It is really a simple "reversed algorithm" of the bellow.
Checking each hash value in the buffer (with some bit shifts..), and the 3 chars location, and the third algorithm.
Nothing complicated, The original JS file was about 5000 Bytes making the total size bigger then 64K
So I deleted any extra space, and shrink the variable and function name to be extra short :)
Making the total size of the JS module 1,128 Bytes.


And that's makes the total solution 62,137 + 1,128 = 63,265 Bytes!


*Note this algorithm promise 0 False Negative, But have some False Positive due to couple of words that may have the same hashing value.