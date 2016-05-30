Our solution is based on the following premises:

(A) The algorithm to check the given word should not be too complex, in order to save space to the data file.

(B) We should avoid to do transformations that the gzip compressor can do for us, for example the replacement of frequent substrings on the dictionary


Because of (A) we decided to create just a string as our structure, trying to include the most of the possible words present in the dictionary

Because of (A) we also decided to work at byte level, and not at bit level.

Because of (A) we also tried to apply simple transformations to the dictionary, based on intuition and statistical approaches. These are:

*-----------------------------------------------------
Transformation 1. Convert all the words to lower case.
*-----------------------------------------------------

We suppose that all words in the dictionary have the same probability of being as input of our algorithm, in this case some words start being more "important" than others. In order to reflect this, we save a "height" with every "chunk" we got. Example:
If Aba, ABa and ABA exists on the dictionary, now we got one chunk "aba" with height 3.

After this, we reduce from 661686 words of the dictionary to 630404 chunks.

*-----------------------------------------------------
Transformation 2. Remove all the chunks that end with "'s", and replace them with the same chunk without the "'s".
*-----------------------------------------------------

With the same example, if we got aba's with height 2, we remove this chunk and now  "aba" has height 5.

After this, we reduce from 630404 to 490823 chunks.

*-----------------------------------------------------
Transformation 03. Remove all the chunks that end with "s", and replace them with the same chunk without the "s".
*-----------------------------------------------------

We detect that almost the 72% of our chunks end with and "s", and the 61% of this 72%, is a "plural" of an existing chunk.

With the same example, if we got "abas" with height 3, we remove this chunk and now  "aba" has height 8.
If we got another chunk "bass" but no "bas" chunk, now we got a "bas" chunk with the same height as "bass". And no more "bass" chunk.

After this, we reduce from 490823 to 410323 chunks.

*-----------------------------------------------------
Transformation 04. Remove all the ocurrences of some letters.
*-----------------------------------------------------

We tried many sets of letters for removing, and this is where we applied our "fine tuning" in order to get a 64 kb solution.

Our criterias were diverse, from pure intuition to statistical.

With the same example (chunk, height):
aba, 8
bas, 2
eba, 3

If we remove "a" and "e", we got:
b, 11
bs, 2

Finally the decide to remove A,E,I,O,U,Y,R,N,C

*-----------------------------------------------------
Transformation 05. Remove chunks that are subchunks of another.
*-----------------------------------------------------

With the same example (chunk, height):

b, 11
bs, 2
bsc, 3

We got:

bsc, 16

It is clear that we can associate a sub-chunk to many chunks. We always choose to associate to the longer chunk, this way we avoid the need to do multiple runs to get the final result. Then, in one run:
b -> bsc 
bs -> bsc

and not 
b -> bs -> bsc 
(2 runs)

*-----------------------------------------------------
Transformation 06. "Linking" chunks
*-----------------------------------------------------

Example: 

bsc, 16
scd, 2

We link the end of one and the beginning of the other:

b + (sc) + d

bscd,18

We started linking with the common part as big as we can, about 13, and then tryin  to link 12, 11.. and finally 1.

Many different links can occur for a given length, in this case we prioritize the link of the chunks with the highest "density", defined as:

density = height(chunk) divided by length(chunk).

Example:

density(bscd) = 18 / 4 = 4.5

This is equivalent to 4.5 dictionary words, per character

*-----------------------------------------------------
Transformation 07. Pure concatenation
*-----------------------------------------------------

When there is no more linking possible, we simply concatenate the remaining chunks into one big chunk, starting with the chunks with the highest density. 

At the moment of cutting this chunk in order to get the final file, we ensure that most of the words are in the part we keep.

*-----------------------------------------------------
*-----------------------------------------------------

Some final considerations:

After some transformations, we can be on the situation that our test word is reduced to an empty string. In this case, there is nothing to find on our file. We had to decide if we return TRUE or FALSE.
What we did is to run a considerable amount of test cases and check how many of the words that become empty were TRUE and how many were FALSE. 
Finally, FALSE wins in more than the 60% of the cases. 

There are some other transformations that we tried but finally discarded because they don't add significant value, like the replacement of frequent patterns with single characters, or considering storing the reverse of some chunks, and later try to find the original chunk or its reverse.

This is our pseudocode for the word classifier:

*-----------------------------------------------------
  translate word to lowercase

  if word ends in "'s"
  then remove last occurence of "'s" in word

  if word ends in "s"
  then remove last "s" of word

  remove a,e,i,o,u,y,r,n,l from word

  if word is blank
      return FALSE
  else
      find word in data string
         
      if found 
          return TRUE
      else
          return FALSE

*-----------------------------------------------------fghjkl

Best regards, we enjoyed the challenge a lot!


	
