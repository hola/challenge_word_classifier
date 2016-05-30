Used approach is a bloom filter + a set of heuristics.

Words covered by heuristics are not added to the bloom filter. So more words covered by heuristics will reduce
hash collision chance.

Another step to reduce collisions is a simplified stemmer. E.g. most of words with "'s" suffix has a word without "'s".
So I add just words without defined set of suffixes and trim this suffixes before checking word via the bloom filter.

I use FNV1A hash for bloom filter due to max implementation simplicity. As tests show, base value, used during
hash calculation can change filter quality. So I ran a couple days test to get better base value. It depends of filter
size. Best found value for 64000 bytes filter is 9544.

Another details with hash - some bits cause much more false positives then other. So I sorted bits by false positives
count and don't set bits with most FP. Different test sets has different top FP bits. But most of them are common so I
intersected couple sets and filter given bits on word adding.

One more addressed issue was a short words handling (word length <=3). To reduce FP on them I check them as word and as
inverted word.

Other heuristics like word length or consonants count are pretty straightforward.