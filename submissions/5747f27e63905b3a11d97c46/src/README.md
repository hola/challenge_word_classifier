Data file contains 4 parts
- perceptor exposed as function
- list of suffixes
- list of prefixes
- list of roots
- list of non words (length < 4 or >20)

programm form a large list of regexps from word parts,  
then if word match any regexp we use it index to form input for neural net. and it gives an answer.
also if word is bad we just compare it to list of bad words. 