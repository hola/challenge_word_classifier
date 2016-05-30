My approach was to use bitap to determine whether the word was English or not.

I first tried to order the words.txt according to which words were the most fuzzy. I used compress.bitap.js with the fuse.js library. I did this by ordering the words by length shortest to longest and then running the bitap search over all the words with first half of my sorted words.

I had to fix my fuzzy scores because they all included the searched word itself. I did this with compress.bitap.fix.js

I used file.bitap.js to create a dictionary file that included the most fuzzy words excluding case, 's and very similar words according to dictionary size limits. 

My solution.js uses that dictionary file in its bitap search.