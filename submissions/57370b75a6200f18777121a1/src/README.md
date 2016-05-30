Short description about the approach: I remove a lot of common prefixes and suffixes, and chop the first and last two letters of each word, then I remove duplicates. With these heuristics there are only 145,143 words left (instead of 661,687). All I have to do now is to "compress" it with bloom filter.

When testing a word I do the opposite of the above.
