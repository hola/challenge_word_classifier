Changes:
v2: 
Ran the fuzzer again, found better values for the sum threshold and len threshold. That's the only change.

v1:
Simplest ngram (for n=2, truncated 3) solution for the hola challenge. 
ngram.py is a naive ngram implementation that also zips and truncates output to fit the 64kib.
runner.py runs is against outputs downloaded form the generator and looks for the best combination of parameters to get
the best score. It tries various values of max_len of word to reject, min score in the ngram test and long word score.
ngram_looker.py is basically the python implementation of the solution in solution.js.