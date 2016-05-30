I tried to keep this as simple as possible, as I don't really have much time to work on these challenges.

My approach was direct: to prune as much of the obvious data but to keep enough to classify it.

A useful manner of compressing this kind of data is a prefix/suffix tree combined with huffman-coding. Luckily, linux has two handy command line utilities, frcode and gzip, which provide these, sort of.

So I wrote a couple of bash commands until I managed to get as much data as I could fit. I decided to stick with words of typical length (>=5 and <=12 letters). Then, I got rid of plurals ('s) and vowels, and split the dictionary into a list of prefixes and a list of suffixes.

The only thing I had to do next is implement a parser for the locatedb format (what frcode outputs). I first implemented and tested this in Python, which I'm more fluent in recently, then translated into Javascript.

Additionally, I had to find a simple way to pack these two files together, and since I had less than an hour (oh, procrastination!) to do the Javascript part, I mocked up an archive file format which has a simple JSON array as a manifest. I produced the archive itself semi-manually using a bash script, again.

On test cases I've gone through, this method yields more or less:
False negatives: 21%
False positives: 11%
True negatives: 31%
True positives: 37%

Considering the length distribution for word length outliers (<5 or >12) didn't improve these much.

I had several other ideas, but not enough time, merit or ability to implement or pursue:

  - using other statistical data, such as letters adjacent to vowels
  - use lossy compression techniques on the text
  - doing principal component analysis and cluster terms together
