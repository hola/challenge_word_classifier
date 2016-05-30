1.  Word Signatures List

The idea is to convert every word into a 20-bit signature. A given word
is considered English iff its signature appears in the list of
signatures made from all the dictionary words. Signature calculation:
The first bit (LSB) is a length parity bit - it's set iff the word's
length is an even number. For the other 19 bits, bit 'i' is set iff the
word contains any letter whose index is 'i'.

Notes: - Letter's index is determined by a special ordering, wherein a
more frequently used letter generally has a smaller index (this will
improve the compression rate, as described below). The ordering starts
from being strictly frequency-based, and then optimized using the
standard numeric gradient calculation technique until a locally optimal
ordering is found - The number of unique signatures is 3.5 times smaller
than the number of dictionary words, thus creating a certain level of
degeneration, which produces false positive results (see below) - Some
indices are shared between two or three (least frequent) letters, in
order to fit 27 letters (including "'") into 19 indices. This increases
degeneration only slightly, but reduces the database size considerably -
The dictionary is automatically converted to lowercase to make the
matching case-insensitive - The signatures are calculated only for the
words with lengths in the [5,15] range. Shorter words are handled
separately (see below), and for longer words the signatures are too
degenerate to be useful (longer words are too rare anyway - just 3.4% of
the dictionary)

2.  Excluded Combinations List

The degenerative nature of the signatures causes a lot of false
positives, so the database also includes 10,813 rarest 2- and 3-letter
combinations in the dictionary, supplied in the "exclude.txt" file
(calculated separately). If a test word contains any of these
combinations, it is assumed to be non-English. This does generate a few
false negatives, but the reduction in false positives more than makes up
for it.

Notes: - The combinations are converted to numbers using the following
linear combination formula: 28a+784b+21952c, where a,b,c are indices of
letters 1,2,3 - Letter-\>index conversion is based on the same principle
as above (most frequent letters go first + local extremum optimization),
but without the index sharing. The ordering is also very different than
in the signatures list, because it's based on the letters' frequencies
in these combinations only. Index 0 is reserved for the Null Terminator
to accommodate combinations of different lengths (hence the 28 base in
the formula)

3.  Short Words List

1/2/3/4-letter words are not converted to signatures, but rather stored
as they are, producing 100% accurate results, at least for the words
that fit into the database (which is all of the 1/2/3-letter words plus
54% of the 4-letter words).

Notes: - No point using signatures for such words, because 20 bits is
enough to store a complete 4-letter word under the 28-letter alphabet -
The words are converted to numbers just like in the previous section,
except that the letter-\>index conversion is very different (based on
the letter frequencies among 1/2/3/4-letter words only)

4.  Database optimization

The above 3 Lists contain over 200K unique 20-bit values (300KB even
after GZIP), so the following (lossless) optimization algorithm is used
to reduce the database size:

4a) Each of the 3 Lists is sorted separately in ascending order of
numeric values (since order is irrelevant, there is no information loss
here).

4b) A new list is created, which includes only the *differences* between
adjacent values. The two negative differences (at the points where a new
list begins) are skipped. The sizes and initial (smallest) elements of
each original List are hardcoded into the 'init' function.

4c) Each difference D is encoded as a following bitmap: N zero bits,
followed by '1', followed by N bits which contain the value of D-2\^N,
where N is selected such that 2^N\<=D\<2^(N+1). For example, D=1 is
encoded as "1" (a single bit), D=2 as "010", D=3 as "011", D=4 as
"00100", etc.

Notes: - 4c is where those special letter-\>index conversions come in
handy - they make the average difference smaller because set bits are
more densely clustered near the LSB. In fact, 60% of all the differences
are 1, and 90% are less than 8, so each element occupies only 2.6 bits
on average - With such optimization, 200K values are neatly packed into
a 67.3 KiB file, 63.3 KiB after GZIP - The JS code that decodes and uses
the database is space-optimized to the limit using every conceivable
trick ("x/y|0" integer division instead of "Math.floor(x/y)", 1-char
identifiers, reused variables, no redundant white-spaces or tokens,
etc), reducing it to just 671 bytes - The complete program takes 64 KiB
of space precisely (not a single byte wasted), while correctly
identifying 95% of English words and 51% of non-English words
