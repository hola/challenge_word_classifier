This program first checks for valid words shorter than 4
characters.  These are all listed in an array in the data.

Then it discards 's at the end of the word and ignores
it completely.  The english rules for apostrophe are
just too wierd.

Then it checks for words longer than 17 characters.  These
are all listed in an array in the data.

Otherwise for words of 4 to 17 characters, it checks if all
the digrams and trigrams (ie. sequences of 2 or 3 characters)
in the word are also in the supplied word list.  If not, the
word is regarded as incorrect.  The lists of digrams and trigrams
was created with the attached C program.



