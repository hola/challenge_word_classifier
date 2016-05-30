Randomized (probabilistic) algorithm based solution.

Description.

Well, I believe it is not a really competitive solution for the problem, but rather an interesting proof-of-concept I really had fun to experiment with.

The algorithm used in the submission is very simple:

During compilation stage:

    1. Take the dictionary provided, translate each word to lowercase.
    2. Prepare a huge number of different hash function (I used 45000 fnv1 with random seeds here).
    3. Apply all hash functions to each word from the dictionary.
    4. For each hash function:
    4.1. Take all its result values (630404 32bit fnv1 hash values in our case for each hash function).
    4.2. Find the smallest integer number such that none of these result values is divisible without remainder (i.e. hash % divisor != 0 for all hash values).
    4.3. Save this divisor into result data file which will be called a "signature" for the dictionary.
    5. We should end with a "signature" data file containing as much "smallest divisors" as possible with our size limits (65536 bytes without js script).
       It is approx. 32000 divisors in our case for 16bit values.

During match stage:

    1. Take the word provided.
    2. Apply 32000 hash functions to it.
    3. After each hashing result is received check it against "hash % divisor == 0" condition. Divisors for each hash function is taken from the signature.
    4. If the condition is true, then return "false" immediately.
    5. If no such condition is handle, then return "true".

The main idea for this algorithm is, according to the probability theory, there likely will be such a divisor that doesn't match the condition among 32000 different hash function. And the bigger is the number of these hash functions, the closer will be result to 0% of false positive. 

Unfortunately, I didn't manage to finish my experiment in time, because I started just a day before the deadline. My current submission contains the signature for only 160000 words from the dictionary (as many as one 8-core machine managed to calculate). The signature for the whole dictionary I will build during weekend (probably), but this will be after contest end of course.

So the current results for my partial signature is about 61% hits, as "test.js" script shows. I expect about 75% max according to my calculation for the current implementation, but the real numbers may be different.

I don't believe I will win any prize, but at least I hope you will find my idea interesting.



Credits:
 - Mersenne Twister pseudo-random numbers generator code: https://github.com/boo1ean/mersenne-twister
 - FNV-1 32bit code: https://github.com/wiedi/node-fnv