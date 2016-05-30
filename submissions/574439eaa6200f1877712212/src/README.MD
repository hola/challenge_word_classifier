Preperation:

Phase 1: remove dumplicate words from words.txt, remove pupular suffixes and clean the list once again. 
Phase 2: calculate hashes on all the word, and save them to bitmap of size 60536
Phase 3: check what pairs and triples are not appearing in the clean list of words
Phase 4: encode the triples in 5 bit and take as much as you can after writing the solution.js code

Solution Init:
Phase 1: read the hashes from the data
Phase 2: read the pairs
Phase 3: read the triples from the data
Phase 4: read the suffixes
 
 
 Solution Test:
 Phase 1: check if word is legth 2 or 3, return true if so
 Phase 2: clean the word from suffixes
 Phase 3: check for invalid legth, return false if so
 Phase 4: check for invalid pairs or triples, return false if so
 Phase 5: check if the hash of the word is in the hash dictionary
 
 