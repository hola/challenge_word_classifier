## Structure
- module.js - *module with ```init(data)``` and ```test(word)``` API methods*
- module.min.js - *minified module.js*
- compressor.js - *dictionary packer*
- test.js - *script for module testing*

## JS minification

Module minified by [google clojure compiler](https://closure-compiler.appspot.com/home) in advanced mode and manual changes.

## Algorithm

Words packed in partial trees with max level = 4.  
Each tree is a sequence of possible characters with length 4 starting from each third index.  
Nodes with childs count < 3 cut off.  
For leafs (ending of the words) save conjunction of possible words hashes (1 bit XOR).  

```Module.init(data)``` method unpack data to array of trees and save to global variable.  
```Module.test(str)``` iterate over parts with length 4 from each third index of word and test it in appropriate tree from global variable. If test passed and hash of word equals ```1``` and leaf hash equals ```1``` or hash equals ```0``` than method return ```true``` else ```false```.

Example of word **smuttinesses** converting.
```
    |0|1|2|3|4|5|6|7|8|9|10|11    |
1:  |s|m|u|t|
2:        |t|t|i|n|
3:              |n|e|s|s|
4:                    |s|e |s(end)|
trees
```

### Tree compression

Each byte of tree in result packed data contains:
```
bits | 0   | 0 0 | 0 0 0 0 0  
     | end | lvl | char data (31 symbol)
```
Each packed tree data separated with ```0xFF``` symbol.  
Compressed file ends with ordered bit array of leafs hashes.