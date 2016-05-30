  Algorithm
-------------
A. data.gz
   A.1  calculate word index   (function process in solution.js)	  
	  - cut final s's or 's  or s  from word
	  - reject (return -1) any word if :
			- length>15
			- it has ' inside ( not final 's)
			- it has 5 consecutive consonants
			- it has tripple letters
			- it has a double letter at begining
			- it has consonants to vovels ratio too big ( 5:1 )
			- it has a rare 2 letter combination
		- calculate CRC32
		- return crc32 % 500.000
	A.2 build HashArray (function buildHashTable in buildHashTable.js - first part)
		- initializes an array of size 500,000
		- for any word from words.txt
			- calculate word index
			- array[word index]=1
	A.3 compact   (function buildHashTable in buildHashTable.js - second part) 
		- build second array  
			- every 8 integers ( 0 or 1 )  from first array => 1 Byte in second array
	A.4 gzip (form node.js)
		- transform second array in Node Buffer 
		- gzip
		- writeFile data.gz

B. solution
	function init(Buffer)
		- rebuild HashArray ( reverse A.3 step)
			 - 1 integer from Buffer=> 8 integer (0 or 1) in final array
	function test(word)
		- calculate word index ( same as A.1) 
	    - return array[word_index]==1




About hashtable program
-------------------------

index.html - main page 2 text area 2 button
	- "Build Hash Table" button => display in first textarea second array from A.3 step
	- "TestAlg" button read from second text area 1 or more testcases . 
				Every line must have :  word,1=word / 0=nonword, test_number
				Example:
					...
					uncerated,1,64
					admonish,1,64
					flingylease's,0,64
					chilblazer,0,64
					...
	

words.js contain  word list as array(not included ): 
		var wlcomplet=["A",
		"A'asia",
		"A's",
		"AA",
		...]

buildHashTable.js - A.2 step. Called by "Build Hash Table" button

test.js - testing program. called "TestAlg" button  
    
solution.js

nodejs code:
		var v= require('hashTableAsArray2.js');  //exports.vv=[203,12,...,33]
		var b=buffer.Buffer(v.vv)
		const zlib = require('zlib');
		z=zlib.gzipSync(b,{level:9})
		z.length
		fs.writeFileSync('data.gz',z);
