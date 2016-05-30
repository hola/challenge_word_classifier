Eli's Solution for Hola words challenge
==========================================
For my solution I used a Bloom filter with one hash: I created a bit array of size n, for each word I extract l=(h(w) mod n) and set bit in location l.
The hash function I chose is MurmurHash, it guarantees enough uniformity to be suitable.

This guarantees 0 false negative rate  false positive rate =~ 1-(1-1/n)^N. (#size of bit array (n),#words inserted (N))
Which gives about 0.7 for n=64KB,N=640000.
To push this down a bit I used information derived from the specific set of words we got.
* each word that ends with 's also exists without the 's so when adding and testing words I strip a trailing 's. This makes N smaller by a sixth or so.
* I extracted 2grams that do not exist in the dictionary . This gave me a list of 14 2grams. So test words containing these are false.
* I found that the longest word is 60 characters long, so I filter any longer words.

This gave about 71.4% success rate for 100 randomly sampled test sets.