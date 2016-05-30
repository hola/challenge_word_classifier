The process of data creation:
1. I wrote a simple C++ program, to generate all unused 3-charackter sub words from dictionary (words.txt) and saves it to .csv file.
1a. Data has been divided into 2 columns: 
Column1 - 3-charackter subwords (i.e. qqq, uun etc..)
Column2 - Number of occurence of particular subword in every dictionary word.
(That is the reason I wrote subwords generator in C++, due to multithreading, the analysis takes about 30 - 40 minutes depends on machine you run it)

2. I opened the csv file in MS Excel and sorted content by Column2.
3. I choose all data from Column1 where number of occurences in Column2 equals 0 (zero).
4. I tested the solution. It was good, it gives me effectiveness of about 52% word recognition correctness.

5. I was curious, what happen if I generate all unused prefixes and suffixes. I've done it and I tested it.
5a. There was decrease of efficiency on suffixes, but it was huge increase of efficiency on prefixes (about 57%).
5b. I tested my solution on 100 testcases, (I mean 100 x 100 words in each testcase).

6. Just to check if any of invalid prefixes can be also invalid suffixes - I added it to final solution and efficiency of my solution is about 59 - 60%.

For more information please email me on: jacek.mankowski1@gmail.com

:)
