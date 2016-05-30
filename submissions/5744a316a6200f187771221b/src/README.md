HOW IT WORKS.

METHOD.
The main classification method is based on the “transition matrix” created for the whole dictionary (converted to lowercase). The transition matrix is a table each row of which corresponds to a 3 letter prefix (including ‘^’ - the beginning of a word) and each column of which corresponds to a letter (including ‘$’ - the end of a word), the cells contain the number of cases the letter (column) was encountered right after the prefix (the row). Thus if for the “'ar” prefix row we have 2 in the ‘e’ column that means we had just 2 cases of the prefix followed by ‘e’. The matrix was compressed so that each row was encoded by a 32-bit word where each cell content was encoded by single bit - set true if the original matrix cell value was > 3. A word in test is processed from the beginning by a moving 3 letter window (‘^’ is always the first letter) looking if the next letter’s bit is set (true). If the process reaches the end of the word (‘$’) then the test is considered passed otherwise it failed. Since this method due to the matrix compression would have some percent of false negatives (the dictionary words which would fail the test) all these words were put into another dictionary (bad words) and the bloom filter (https://en.wikipedia.org/wiki/Bloom_filter) was created for these dictionary. The bloom filter is used as additional test (or-ed with the main one) to get the “bad words” pass the test too. The parameters of the bloom filter were adjusted experimentally to get the lowest error percent for some test case. Some initial simple tests are applied before the main one: for a single letter words - passed if (<word> belong to [a-z]). For the words which contain > 3 of "'" letters - passed if is in strangers list (hard coded).

DATA FILE.
The sorted set of 3 letter prefixes was also compressed using the following method:
The first item is taken as is. If an item has common prefix with the previous item it is encoded as <pfx_len><suffix>, where <pfx_len> is the length of the common prefix and <suffix> is the rest of the word. 
Example:  'ac 'am 'an -> 'a'2c2d.
The compressed prefixes string was written to the data file without delimiters, terminating by ‘\n’, the compressed matrix was written right after the prefixes. Since the compressed transition matrix. The bloom filter was written after the matrix. The resultant file was compressed by 7z (gzip with max compression).

CODE.
The original code was compressed with online Closure compiler (https://closure-compiler.appspot.com) with the simple optimization option.


The bloom filter implementation was  based on this article:
http://blog.michaelschmatz.com/2016/04/11/how-to-write-a-bloom-filter-cpp/
The murmurhash algorithm implementation in javascript was a bit restyled versions of this:
https://github.com/garycourt/murmurhash-js. The murmurhash-js copyright and the license are given below.
License (MIT)
Copyright (c) 2011 Gary Court
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.