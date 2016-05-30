JS Challenge Spring 2016: Word Classifier
=========================================

Result #2 / May 27
------------------

Total size:  
63.96 KiB (65490/65536)

Words added to the bloom filter:  
257918/630378 (59.09% were rejected)

Average test accuracy:  
77.6985069%

What was changed
----------------

The implementation is based on its previous version from May 22.

 - Changed the way of storing serialized bloom filter - instead of converting it to hex I used Uint8Array.  
 - All JavaScript files were combined into `solution.js` and optimized (because of binary contents of `data.gz`).  
 - Improved word processing.



Result #1 / May 22
------------------

Total size:  
64 KiB (65534/65536)

Words added to the bloom filter:  
262570/626126 (58.06% were rejected)

Average test accuracy:  
76.4440243%

How it is implemented
---------------------


###make-dist.js
This file minifies the execution file `solution.js` and generates the extra data file `data.gz`.  
 
 1. Filter out all abbreviations, processors (see `processors.js`) can't work with them.
 2. Process all words using `processors.js`, add returned ones to the final set of words.
 3. Set up the false positive rate. I used `0.43915` to get as much accurate filter as possible. 
 4. Minify `processors.js` and `bloom.js` using Closure Compiler.
 5. Create a string which defines 3 global variables once evaluated:
    - `p` - minified processors function
    - `b` - minified bloom filter
    - `f` - test function
    
 6. The value of the test function is a result of calling bloom factory with serialized hash.  
    The trick here is how the hashes are stored:  
    Hashes here are integers 0..255. Let's say we have `[4, 80, 255]`.
    Combining them together using `join()` is OK (the result is `[4,80,255]`), but it's not an optimal solution.  
    
    **First attempt:** convert each entry into 3-char string.
    4 converts to "004", 80 to "080" and 255 to "255".  
    Join them using no separators e.g. `['004', '080', '255'].join('') => 004080255`.  
    This string can be easily converted back to integer `.match(/.{3}/g).map(Number)`.  
    The solution is still not the best one but saves few kilobytes after gzipping.
    
    **Second attempt:** convert each entry into hex.
    4 converts to "04", 80 to "50" and 255 to "ff".  
    Join them using no separators e.g. `['04', '50', 'ff'].join('') => 0450ff`.  
    Again, this string converts to integer `.match(/.{2}/g).map(str => parseInt(str, 16))`.  
    This also saves few kilobytes. Conversion to binary works worse, but still better that attempt #1.
    
 7. Gzip generated string which looks like:
 
        p=function(){/**/};
        b=function(){/**/};
        f=b("0450ff").match(/.{2}/g).map(s=>parseInt(s,16)))
        
 8. Write generated files to the `data` directory.
 9. Print the statistic if run with any parameter e.g. `node make-dist.js y`.


###processors.js
The most interesting part - word processing.  
It contains rules found in the **Resource** section (below) and few more, created on my own.  
The module exports a function with 3 arguments:

 - [0] word to test
 - [1] test function, used to test whether the word is valid or not
 - [2] done function, used to add the word to the set of processed words or just return its state - valid or not
 
The code itself is quite descriptive, so I'm not going to explain here what is going on inside it.


###solution.js

Closure Compiler allows to minify ES2015 but the result code will be converted to ES5.  
Because ES2015 is more compact it's more convenient to use it.

ES5 (147 bytes):

    e=exports;e.init=function(b){return eval(b+"")};e.test=function(b){return r=0,p(b,function(a){return(r=!a[3])||f(a)},function(a){return!r&&f(a)})};

    
ES2015 (85 bytes):

    e=exports;e.init=d=>eval(d+"");e.test=w=>!!(r=0)||p(w,m=>(r=!m[3])||f(m),m=>!r&&f(m))
    
A bit later I found that after the processing the word, it's possible to get an empty result.  
So I started playing with returning `false` for such cases and found out that the best result can be achieved if 
the `false` value is returned for processed word which has 3 or less chars.


###benchmark.js

Runs the built script from the `dist` directory against testcases in `testcases` directory.  
Can print some statistic if run with any parameter e.g. `node benchmark.js y`.


###bloom.js

Modified version of [bloom-filter](https://github.com/bitpay/bloom-filter) library.  
Has its minimum to test whether the word is in the dictionary or not -
the factory accepts the list of hashes and returns the test function.  
I chose this library because its serialized data weights less in comparison to other implementations. 


###es6-minify.js

Modified version of [es6-minify](https://github.com/ariya/es6-minify) library.  
It just removes the whitespace from ES2015 code. Used to minify `solution.js`.


###print-reject-pairs.js

Get 2-char pairs that aren't valid.


Notes
-----

 - [Golomb-compressed sequences](https://news.ycombinator.com/item?id=4576558) didn't work for me
   because generated code wasn't "compressible".

 - Would be cool to see the implementation using
   [this approach based on matrix solving](http://arxiv.org/pdf/0804.1845v1.pdf).


Resources
---------

  - Su Zhang "Spell Checking using the Google Web API"
  - M. D. McIlroy "Development of a Spelling List"
  - [Bloom Filters](https://www.jasondavies.com/bloomfilter/)
  - [Spellchecking by computer](http://www.dcs.bbk.ac.uk/~roger/spellchecking.html)