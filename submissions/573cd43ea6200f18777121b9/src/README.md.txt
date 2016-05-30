1) I calculated frequencies of each triplet in dictionary , using test.js . 
for example the following corpus was dumped as follows : 


Corpus : 
Hola 


tripletMap.txt (triplet to its frquency of occurance) :
hol:1
ola:1
la:1


2) After this i just kept doing some phacking with dumping variety of data sets to observe some statistics which i used in my test() for evaluating result.

3) Inside test function , i am checking whether the triplets of given word are present in Buffer , if yes then i am checking total frquency 	values against some statistics varibales observed during phacking of dictionary.


