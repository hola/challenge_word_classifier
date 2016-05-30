Cf folder contains convR.js - hash calculator, use it to calculate hashes and copy uniqueArrToWrite.dat file to Gf\DATA folder 

Gf folder contains compressor cInt.js. It generates bitpacked and gzipped data.gz for solution.js

R - solution folder

The main idea is to find a hash function which gives evenly distributed hashes for correct words. Such hashes might be bit-packed (or encoded using delta-coding) and compressed significantly using gzip.

