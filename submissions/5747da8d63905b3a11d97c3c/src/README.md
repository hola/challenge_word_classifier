# Making of the Data file (using a ruby script)
1. Looping through alphabets a-z
2. For each alphabet, loop through the dictionary and each word and store the frequency of elements at i-th position from the first alphabet of the word (which is also the alphabet we are looping through in step 1).
eg. letter = h.

3. Assuming "happy" was the first word while looping through the dictionary, we'd get

h_1 = "a_1_5_5" .. At first position after h, we have the alphabet a. The frequency of a coming after h is one right now with the minimum length of the word being 5 and maximum 5.
Similarly,
h_2 = "p_1_5_5" 
h_3 = "p_1_5_5"
h_4 = "y_1_5_5"

4. After looping through all the words starting with h, we will have something like:
h_1 = "a_144_4_16_10" .. There are 144 words where "a" comes at the first position after "h". 4 is the minimum length of a word amongst those 144 words, and 16 is the maximum length. 10 is the average length.

5. This will be the content of the data file.
From a_1 to z_20.


# Node
Lets say the word given to me is "happ".
1. The init function will read the JSON data from the data file.
2. It will check the alphabets in the word, i.e. 'h','a','p','p'

3. It will check the frequency of each alphabet in their relative positions from the root alphabet "h" from the jsonData.
~ letters : [ 'h', 'a', 'p', 'p' ]
~ frequency : [ -1, '11730', '230', '940' ] .. The frequency of the first alphabet is hardcoded to be -1.

4. The alphabet corresponding to the minimum frequency is selected. 
~ Minimum frequency : 230
~ Index in array : 2
~ Target alphabet : 'p'

5. The word length details corresponding to h_2_p is checked.
~ Min word length : 5
~ Max word length : 17
~ Average word length : 11

6. The program checks the length of the word given to her. 
~ Word length : 4

7. The program returns "false" because the word length is less/greater than min/max threshold (4 < min_length)

8. If the word length falls within the min/max threshold range, then the program returns true/false based on whether the word length equals the average length(+/- 1)

