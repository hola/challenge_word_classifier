### Solution Approach

The initial approach to solve the challenge was by using the bloom filter data structure.
This structure's drawback are False positive matches, but the greater advantage is that
False negatives are not possible. or in another terminology query returns either
"possibly in set" or "definitely not in set".

### Solution buildup

For generating the filter's bit-array, Python 2.7 was the easy answer for me,
since it has excellent data manipulation capability.

The following workflow was used:

For every word in the dictionary.


1. After converting to lowercase remove suffixes: 's, es, er, ed, ly & ing repeatedly.
  meaning the word 'abcedinged' will become 'abc'.

2. Remove prefixes: un, co, re, in, pre & pro repeatedly.
  meaning the word 'incoreabc' will become 'abc'.

    **Note**: A prefix or suffix will not be removed if that creates a zero length word.
3. Calculate the hash value H (using [SAX](http://www.eternallyconfuzzled.com/tuts/algorithms/jsw_tut_hashing.aspx) modulus bit-array size) for the word.

4. Set the H-th bit in the bit-array to 1. ie, if the hash value is 156 then bit 156 in the array will be set to 1.

This gives a bloom filter with no false negative but with a high false positive rate.

The next phase is going over 10,000 test files obtained from the [public test case generator](https://hola.org/challenges/word_classifier/testcase),
Counting how many True word and how many False words fall into each hash value.
(I am using the same steps 1 to 3 from above for each word)
If there are more False words then True words for a hash value then I set it's corresponding
bit in the bit-array to 0.

This effectively remove dictionary words from the bloom filter,
adding false negative results but also remove more false positive results from the filter,
thus overall performance improves.

The last change I made to this algorithm is to discard any words that are longer than 14 characters. they are always considered to be False.
and their hash value is never calculated.

The same principle of removing more false positive than adding false negative
applies here as well.

The bit-array size was calculated to be the remaining memory left out of 64KiB limitation
after coding the Java Script.
The value in bits was rounded down to the nearest prime number
as it turned out to improve results.

### API Code

The JavaScript code handles both needed functions ('init' and 'test') for the Challenge.

***init*** gets the 'address' of the bit array filter File (created by the Python code) from the supporting mechanism ('Node.js') and assign it to the appropriate Unsigned 8bit array. For an unsuccessful assignment, 'Undefined' is returned. The successful assigned array will serve the test
function.

***test*** gets a string. if it is longer than 14 letters it returns *False*.
Otherwise the same process of converting to lowercase, removing the suffix and prefix as in the Python Generator
is done.
The hash value is calculated as in the python generator and the relevant bit in the
bit-array is checked.
If it is 1,it returns *True*, if it is 0, it returns *False*.
