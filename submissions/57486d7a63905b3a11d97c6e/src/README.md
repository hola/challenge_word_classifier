##How to prepare "data" file

1. Copy words.txt to folder with build.js file.
2. Run build.js (at the first time building may take few minutes)

File stats.csv contains statistic for every word from words.txt (excluding words considered as duplicates e.g. microvillus and microvillus's).  
  
e.g.: delphinine,9,0.9  
delphinine - word  
9 - how many words can be predicted by this words  
0.9 - ratio between value above and word's length  
List of stats is ordered by ratio desc, value, desc, length asc  

##Data file

Data file contains limited number of words from stats list. They are arranged in tree data structure. Next, tree structure is serialized with DictionaryTree's "format" function. Function "parse" can rebuild tree from serialized data (see build.js file).

##Tree rebuild algorithm

Fragment of data file content:  
contrasters9dly8s8y8ingly9vely8able11y8ment6tempo8nor6ctus

Algorithm:  
-> add to tree   
contrasters  
-> go to indent 9  
contraste  
-> add dly and write  
contrastedly   
-> go to indent 8  
contrast  
-> add s and write  
contrasts  
-> go to indent 8  
contrast  
-> add y and write  
contrasty  
-> go to indent 8  
contrast  
-> add ingly and write  
contrastingly  
-> go to indent 9  
contrasti  
-> add vely and write  
contrastively  
-> go to indent 8  
contrast  
-> add able and write  
contrastable  
-> go to indent 11  
contrastabl  
-> add y and write  
contrastably  
...  

Result:  
constrasters  
----------dly  
---------s  
---------y  
---------ingly  
----------vely  
---------able  
------------y  

##classifier.js
This is the main file which contains rewritten functions from build.js to parse data and to check whether the dictionary contains given word.
Before checking dictionary, classifier tests given word against three regular expressions that are results of words.txt file's analyzis.
If given word matches one of the rules or isn't present in dictionary, test function returns false. File is minified from classifier-src.js with http://refresh-sf.com/.