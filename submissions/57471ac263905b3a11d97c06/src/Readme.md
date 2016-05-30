# Word classifier - Hola Challenge

Participant: Gabriel Vîjială
( gabriel.vijiala@gmail.com )

# This solution

This is uncompressed bloom filter that spans
around 60k, with 500k bits. That makes 0.72 bits
per word.

The thing is I evolve the hash function used
using a genetic algorithm. I use my own random
word generator (that doesn't really work as Hola's)
to score the hash functions on the actual bloom
filter.

After this, I remove some entries from the filter,
so it reaches 50/50 false positive/negative rate.

The idea is to evolve a hash function that has
more collisions with the words in the list,
but performs uniformly otherwise.

The basis for this given hash is a FNV hash
with two parameters. For simplicity, i run the
calculations modulo the number of bits in the
filter.


# Other solutions

I've tried solutions based on neural networks.
I don't really know how to represent the data
well enough for the network to learn properly.
