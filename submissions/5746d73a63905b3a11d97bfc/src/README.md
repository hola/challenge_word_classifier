Hello.

Current solution is C#. This is where i prepared data for js script.

module.js - is the node.js module without any minification.

When choosing approach i have tested neuron networks at first. But in our case we have sufficiently random words and good word
can differ very weakly from wrong word. This makes neuron network uneffective in the case of limited solution size.

So the best way when good and bad words are very close is to use hashes of words. In this case very close bad and good words generate
hashes that are very differ from each other.

So i decided to use bloom filter. 

The main problem here is the count of source items - after removing duplicates it is about 630000. Bloom filter doesn't depend on size of each word but depend
on size of words so the primary task is to reduce words count.

So before Bloom filter start to work i apply special filter that cut longest words, cut least used words (by sorting all words by first two symbols).
Also i remember all two symbol words. All of them exist except 128 two words combinations.

One more filter is based on assumption that if you have for instance the word "flower's" the word flower should be. It means that with some probability
we can remember only "flower" word and if our prefilter detects that word finished with "'s" it removes last two symbols and pass to Bloom filter only "flower".

So that's all.

Current solution builds result data file and shows error statistics.