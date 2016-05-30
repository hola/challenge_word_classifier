# Algorithm overview:

	* Replace affixes (suffixes/prefixes) using substitution tables
	* Large Bloom filter to test whole word
	* Small Bloom filter to test word prefix
	* Few small heuristics

Algorithm uses 'data.gz' file which contains:

	* Affixes substitution table
	* NotC2 table
	* Main Bloom filter
	* Prefix Bloom filter
	* Javascript code

## Init function
	
	* Eval javascript part of buffer
	* Execute evaluated function init, which loads all of data parts
	* Map exports.test function to evaluated corresponded function

## Test function

	* Remove suffix 's
	* Execute affixe replace commands
	* Calc vowels (aeiouy) and consonants representation of the word
	* Test word for:
		** Length no longer than 14
		** Word does not start with '
		** Main Bloom filter says yes
		** Word has no more 4 vowels in the row
		** Word has no more 4 consonants in the row 
		** Word has no more 1 symbol '
		** Prefix Bloom filter says yes for the word
		** Word has common substrings with NotC2 table

# Solution generator

Written in C#, has a lot of tricks and test functions to check which parameters to use. Has class SolutionCreator that manipulates javascript files, creates data file