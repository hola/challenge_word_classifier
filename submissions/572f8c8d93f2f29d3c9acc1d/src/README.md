# README

This README file contains a short description of my thought process and how I came to the final solution.

First of all, I am not a JavaScript developer so the code I have submitted could probably be written in more standard and idiomatic way. I mostly write Golang and Python code these days although I used to do a fair amount of JS in the past.

I do own a copy of `Javascript: The Good Parts` from `Douglas Crockford` and have read it several years ago as well as watched several of Douglas' presentations online so I believe I grasp tha basic concepts of writing good vanilla JS.

Anyways, the first think I thought when reading the description of the problem was to research what kind of data structures can hold relatively big dictionary of words in a way to minimise the size of the structure. Fitting into 64 KiBs was not easy.

During my research I have found a that there is a data structure which used by JavaScript developers for storing dictionaries of words in order to autocomplete or suggest user input. This is called [trie](https://en.wikipedia.org/wiki/Trie).

I did a bit of more digging and found out that `John Resig` (from who I also own a copy of book about JavaScript called `Secrets of the JavaScript Ninja`... although I haven't read this one completely to be honest, just some relevant parts few years ago when I was doing more JS) has an example implementation of `trie` data structure in his GitHub repository - [trie-js](https://github.com/jeresig/trie-js).

So I used John Resig's optimised version of trie and started to run the big dictionary of English words provided by you through his trie generation script. The first problem I encountered was that the file size of the resulting trie data structure after storing all words from the dictionary in the and after gzipping it was still very large.

It became apparent to me I needed to radically decrease the amount of words I am storing. Therefor I started to look at ways to normalise the dictionary data.

There was some low hanging fruit:

- remove all words ending with `'s`, as in the dicitonary they are also included in a form without that suffix
- remove all words beginning with an uppercase letter, most of them seem to be names or abbreviations of companies or organisations

That did help a little bit but I was still very far from even being close to 64 KiB limit.

I decided to do more research and look at ways used to normalise a database of English words. Lots of information retrieval systems seem to use a technique called stemming. I have decided to use a JS implementation of [Porter2 English Stemming Algorithm](http://snowball.tartarus.org/algorithms/english/stemmer.html).

I needed to trim more fat from my data file still and the only reasonable way to get bellow 100 KiB seemed to be to only store a small subset of stemmed forms. After running some tests against test cases provided by you and found out that I have discovered that I was getting the best results when I stored stems with length of 5 or 6 and discarded everything else.

I was just bellow 64 KiB so I decided to add an array of 35 most common English words (these are very short 3-4 letter words) which have been removed from my dataset because of agressive normalisation to perform as well as possible against your test cases.

This has brought my minified JS to 2917 bytes and my gzipped trie data file to 62613 bytes to 65530 bytes total which is `63.994140625` KiB. So you can see I am just bellow the limit and there wasn't really a room to do anything more.

Couple of other ideas / approached I tried or considered. I considered using a different database of English words as my starting point instead of the one provided by you.

One of the datasets I tried was [this one](https://github.com/first20hours/google-10000-english) which contains 10 thousand most common English words according to Google determined with n-gram frequency analysis. My idea was to start with these 10,000 words as my core data set and then start adding stems from the SCOWL dictonary you provided until I reached the file size limit.

However this approach for some reason turned out to produce much worse results. I believe the challenge is a little bit skewed based on your test cases. As it appears the test words you generate are very rarely common English words (by common I mean words which would be part of 10-20k most commonly used English words). Therefor I abandoned this approach. It would be interesting to see how you generate your test cases.

Another thing I was considering during my research was whether I could somehow use [Bloom Filter](https://en.wikipedia.org/wiki/Bloom_filter) to better solve this problem. The idea would be I would populate the Bloom filter with a reasonable amount of words and then choose a certain threshold of probability above which I would consider the test string to be a proper English word, let's say I would say anything above `0.75` (75%) I would return true. And of course, Bloom filter returns false with absolute certainty when the word is not stored in it.

The problem was that I would then need to somehow serialise and store the configured Bloom filter in the gzipped file and load it when you call init method. There are two issues. One would be adding more complexity to the JS script as I would have to add the Bloom filter implementation there. Another, bigger issue is, that Bloom filter grows rather quickly in size, according to [this](http://hur.st/bloomfilter?n=4&p=1.0E-20), a Bloom filter with 10000 words would have 117 KiB. So I disregarded this approach.

I also thought about somehow using neural networks. Train a sufficiently large neural networks (with enough layers and synapses to be able to learn a big set of words) and then use the neural network to determine whether a test string is an English word or not. I have decided against trying to implementing this as after some research it was not obvious whether this was even possible. It would probably add a lot of complexity to JS file, the implementation would be quite difficult and I had serious doubts about the 64 KiB limit.

Currently my solution seems to be able to determine English words from your test cases with 56% success rate which is not great.

If I have more time to come up with a better implementation I will upload another version.
