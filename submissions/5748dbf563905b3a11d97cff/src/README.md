1. Scraped all validation data until 250000
2. Determined the optimal hashing function that would yield >90% on the test sample
That turned out to be the first 5 letters
3. Determined the optimal packing method that would result in file not exceeding 64KiB when gzipped
4. Since the hash set was sorted alphabetically, applied the front compression before gzipping, it cut the file size down instantly
5. Noticed that almost all single-letter words are present with the exception of the apostrophe, so I included them into the hash set regardless of the number of appearances in the testing sets. It barely increased the resulting file size
6. Did the same with all words 3 letters long or shorter. Again, hardly an impact on the file size