The idea is to use the bloom filter to check if word is in the dictionary.
We have 63040 unique words. This is bigger then we can fit into 60kb.
According to Pareto Principle, 20% of data should be enough to have 80% accuracy.
Then we can apply bloom filter to have about 75%-85% accurate results.


## Optimizing data set

The simplest idea is working. Create a list of words truncated to 6 characters.
This way we have ~200000 words, and bloom filter gives nice results up to about 85%.

## Simple hacks
Using only words with length < 13 gives good results.
Also checking in 5 consonants one after another.
Check that ' is in correct place and only 1.

## Making it work
Using bloom filter from http://dren.ch/rel/js-bloom-filter/bloomfilter.js
Play with params so it works nice with 60kb of data.
This gives about ~77% of accuracy.

## TODO
There should be ways to compress bit vector from bloom filter nicely.