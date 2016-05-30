Readme - solution for problem Hola JS Challenge
May 19 2016 

About it
_____________________

Main algorithm based on conversion string into unique number. Therefore we work with list of numbers.
To eliminate entropy in graphics, conversion algorithm will be depend on frequency letters in words with length n. Graphic will be divide on number of clusters. For each cluster will be created approximation function, that describe it.
 The closer approximation goes to points and as bigger polynomial or number of polynomials
 that describe function as more correct result we will get. 

List of length of words and their quantity. 
len-1 m-52
len-2 m-1222
len-3 m-6302
len-4 m-13870
len-5 m-29319
len-6 m-52747
len-7 m-74137
len-8 m-89157
len-9 m-91447
len-10 m-83523
len-11 m-68250
len-12 m-52066
len-13 m-36982
len-14 m-25206
len-15 m-16107
len-16 m-9848
len-17 m-5542
len-18 m-2972
len-19 m-1572
len-20 m-711
len-21 m-349
len-22 m-152
len-23 m-68
len-24 m-38
len-25 m-18
len-26 m-3
len-27 m-5
len-28 m-3
len-29 m-6
len-30 m-2
len-31 m-2
len-32 m-1
len-33 m-1
len-34 m-2
len-45 m-2
len-58 m-1
len-60 m-1

--------------------
Length 30_31_32_33_34_45_58_60 
words  2__2__1__1__2__2__1__1
--------------------

For words with long length we will not convert them into number 
and will compare them with words from dictionary since number of words less then 3. 
--------------------
input - word - str


1.Step
----------------------------------------
Find length(n) of word str
All word in dictionary have length:
	N	[1,34],{45},{58},{60}
All words that doesn't fit in this range will be automaticaly return false.

In programm can be added more checking conditions. To eleminate automaticaly wrong words.
----------------------------------------
2.Step
----------------------------------------
Translate word str to unique number(M)

All upper case letter will be translated into lower case, since test words will be represent by lower case letter.
We can also eleminate some words AA, aa -> aa 
It will reduce number of words aproximate on 21.000.

For word with length >= 3. Code for letter will be depend on it frequancy appearing in the words.

----------------------------------------
3.Step
----------------------------------------
For every length N (n>3) && (n<=34) will be created C-number of aproximation polynomials,
where C is number of clusters N.

For n=1 any word is correct exept (');
For n=2 words will be compared with list of wrong answers. Since their number is much less than number of correct ones.
For n=3 words will be created range of corect answers.

