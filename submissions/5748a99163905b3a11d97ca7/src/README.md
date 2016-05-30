# Introduction

Since I didn't know where to start, I decided to check the words manually to see if they had something in common.

Then, I realised that somehow, there were patterns in the words, for example:

    car
    cat

There, we can see that the words have a consonant followed by a vowel, and a new consonant. Those words are following the SAME pattern.

## STEP 1 - PATTERNS (crypto.js)
I've created patterns following the next algorithm ->
Consonants are replaced by numbers that represents the position where they appear in the word. For example, we have the word WINNER.

	W appears first, so it will be always a 0
	N is the second consonant, so it will becomes 1
	R is the third consonant, it will becomes 2

	For now, we have the following pattern --> 0I11E2

At the beginning, I was going to do the same with the vowels, but my patters would have lost accuracy, so I just do the almost the same but replacing them for letters.

	I is the first vowel, so it become A
	E is the second, so it becomes B

    Final pattern is --> 0A11B2

Of course, my algorithm found multiple words that followed the same pattern. That's how I reduced the main file from 7mb[661687 words] to 3mb[241529]. I decided to call this part as crypto!

After that, I tested my patterns to be sure that I could continue with the next step. Here, I knew that my algorithm has a 75%-80% precition at maximun. (20% of false positives).

# STEP 2 - GROUPS (reducer.js)

Now my file is reduced with many patterns, like the following -

    "0102a","0102a0","0102a021","0102a03b4","0102a0a31","abc","abcd","abce"

So here, in the second step, I grouped the words that have the same 4(I tried with other numbers, but it's almost the same) first characters

Therefore, we will have something like

	groups =  [ ["0102a","0102a0","0102a021","0102a03b4","0102a0a31"],["abc","abcd","abce"]]

Why am I doing that? Because I want to generate trees for every group and after that I can create RegExp, for every tree.


# STEP 3 - TREES
After we have the groups, we need to get a tree for every group. (one of the most difficult parts, because the trees are not regular)
	Example for second group -

		a -> b -> c (leaf) -> d(leaf)
						   -> e (leaf)

# STEP 4 - RegExp
Once we have our collection of trees, my algorithm is going to generate a Regular Expression for each tree.

In our last example

    abc(d|e)?

Here you have a real example
	00a12(3(4)?|a(3(3(45)?|4b3a)|b3450065716700(6c6d37895731103c1050000a110710b0bc6c6c6c89(1010)?|89)?)|b(00c1(34)?|21c(34)?|3(4|bc4(51)?|c4(40a5b(64)?|5(67)?))|c0d(34)?)?)

### Notes
I tried to run my algorithm without skiping any letter. The final step still kept the 75%-80% of accuracy,
that means that the whole process was ok. The issue was that to make my regex file smaller
than 64kb (it was something around 500kb) I had to skip some letters from my patterns.
The letters skipped were - e s  (most repeatted chars) c a m y l
(since it was not enough with e,s) escamyl! sound like a good word to test with the algorithm haha :P!

To understand the algorithm, open file "executer".