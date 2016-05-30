# Guesser
The solution is optimized to pass the Hola tests with the best possible resuls.
## The next files are used for the solution:
- __guesser.js__  the Node.js module itself
- __guesser.min.js__ compressed version of the above module.
- __data.bin.gz__ the gzipped data used by the module.
- __src/wiki-100k.txt__ and __src/20k.txt__ are the the lists of the most frequent English words used to produce the __joint.txt__ file used to generate the __data.bin__ .
- __src/JoinWords.java__ utility that generates the  file __joint.txt__ from the given __words.txt__
and two mentioned above lists of most frequent English words. The resulting file contains most frequesnt English words + all the words from the file __words.txt__  shorter than 9-10 characters (after the __optimizing__). The resulting file size if about 50% of the initial  __words.txt__ size.
- __src/Main.java__ and __src/Packer__ are used for: various experiments, to produce the __data.bin__ , and to run the tests.
These files are given "as is" w/o any code cleanup.
## The Approach 
- firstly each word passes the optimization where the most frequent letter combinations are replaced with the digits 0..9 (there is a spelcial encoding for the word endings), at this step many words become shorter.
- The short 1..2 character optimized words are stored the resulting .bin file "as is".
- The 3 letter words are encoded each to 15 bits/two bytes word where 5 bits (0..31) is used to represent 'a'..'z','\\'' ,'0'..'9' .
The same encoding is used for the longer word processing.
- The words longer than 11 characters are not processed at all.
- For each 4..11 characters long words __getKeys__ function generates a set of 14bit keys, each from them represnts three letters in various positions of the improved input word. The higher 15th bit is omitted to fit the size restriction. The number of the keys depends on the length of the improved input word, the maximal number of the keys is 23.
- When all the  4..11 characters long words are processed,  there is a set of all possible 14bit keys, and for each from the keys there is a 22bit bitmap, where each its bit represents the use of the key as the key number __i__ (where __i__ is a number of key in a keyset
returned by the function __getKeys__ for a word). In the other words, the produced __keys*bitmaps__ dataset represents which letter combinations and sequences can exist in a __words.txt__ word.
- The __bitmaps__ are stored by the order of the __keys__ (the __keys__ are grouped and ordered by the corresponing __bitmaps__).

# About me
- I had worked already in Hola during about two weeks and had been fired, so I don't think that any work in
Hola can be offered to me even if I'll win the first place. By the other hand I am interested to work as a remote outsourcer with hourly payment.


