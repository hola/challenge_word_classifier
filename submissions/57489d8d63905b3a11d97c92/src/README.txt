==== MAKE DATA ======
Run make-data.sh in Unix shell

==== DESCRIPTION ====
Enumerate all four-symbols groups in word list. Start and end of any word also treated as distinct symbol(' ').
Also take in account correlation between prefix and suffix of word(through groups like "'s u", "'s" is suffix, "u" is prefix).
Then just enumerate all four-symbols groups in tested word and throw word out if it contains unknown group.


