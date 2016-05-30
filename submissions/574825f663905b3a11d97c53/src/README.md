===Markov chain probabilistic vocabulary model===
by Yuri Kilochek (yuri.kilochek@gmail.com)

====Features====
* Markov chains.
* Alphabet inflation via merging most frequent symbol pairs until model size limit is reached.
* Regularization of conditional transition log-probability distribution before discretization via transform by cumulative density function of said distribution for better numeric accuracy.
* Tight bit packing of said log-probabilities.
* Word/nonword decision is made based on whichever distribution is denser at log-probability of given string obtained from markov chain.
* Most JS code is packed inside data file to take advantage of gzip compressin. The not packed part just loads and runs it.

