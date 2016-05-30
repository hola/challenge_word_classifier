# Naive algorithm
1) Create 3 dictionaries: prefs, suffix and roots.
2) Split given word by any of the root.
3) Test that first part contains only sequences from prefs and second part contains only sequences from suffs or root+preff: pref+root+ (pref+root+ (...) +suff) +suff.

Prefs and suffs created from popular English prefixes and suffixes. Also, I add some sequences that find appropriate.
roots created by many iterations, while I remove all prefixes and suffixes from each word, delete split combined words (root+root). So now it's contained "roots" in real meaning, but a 3-5 unique sequences.