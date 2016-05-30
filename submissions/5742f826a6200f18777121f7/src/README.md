Word Classifer
==============

Directories
-----------

  libs/              libraries used for creating binary files
  output2/           build script output
  solution/          solution files
    data.gz            binary data used by solution.js in gzip format
    solution.js        minified by google closure compiller
 
  /verification       JSON files with sample tests
  
  buildBloom.js       Bloom filter, used for experiments with parameters
  buildComplete.js    Complete solution. Used to create "data" files
  buildMatrix.js      Syllables statistical matrix, used for experiments with parameters
  README.md           this file
  solution.js         Original, non-minified solution
  words.txt           Original dictionary file
  

Usage
-----

Generate "data" file (./output2/data):

  $ node buildComplete.js
  
