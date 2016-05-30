Algorithms I Used here:

init:
1) Read the dictionary file into a string variable.
2) Split string into array, splitting using "\n\b".
3) Sort the array by string length.
4) Decide the middle index of the array.
5) Decide the string length at the above index. 

test:
1) Is word length bigger then the middle word 
	1) yes: search from the end using the built in Array method "lastIndexOf" 
	2) no: search from start using the built in Array method "indexOf" 
2) is index bigger than -1 ?
	1) yes: the word is english
	2) no: the word is not engliush