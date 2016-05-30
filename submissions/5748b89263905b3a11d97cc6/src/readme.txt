We created the wordsMini gzip with c++ code.
The code checks all legal 3 letter substrings and has a count and if they are also prefix and postfix.
We use this data to eliminate alot of negatives but we are left with some false positives.
we minimize those by cheking how rare the combinations are and returning false for rare cases.
We run the code with differant parameters unitl we maximuzed the success ratio.


To minified we use online tool:
http://jscompress.com/
