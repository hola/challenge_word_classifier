# Explanation

Extract all 7-character sequences from source dictionary and then compact it with Bloom filter. Compare each n-gramms of given word against prepared list and reject that word if some n-gramm is not found.

# Usage

* Run `npm install` to get required dependencies
* Replace empty `./data/words.txt` with actual dictionary file
* Put test cases into `./testcase/` directory (optional)
* Run `node prepare.js`. Data file will be created in `./solution/data.gz`
* To perform tests, execute `npm test` command 

# OSS

This solution contains adapted code of the bloomfilter library distributed under 3-Clause BSD License:

> bloomfilter
> Copyright (c) 2011, Jason Davies
> All rights reserved.
