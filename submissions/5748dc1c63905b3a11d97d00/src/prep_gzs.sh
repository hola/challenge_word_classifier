#!/bin/sh

# chose 5-12, 6-11 since it bring us to high enough coverage
# I'd rather store shorter words, even if occuring slightly less, over long ones
# this is a compromise to be within size limits of the challenge
grep -v "'s"'$' words.txt | awk 'length($0)>=5 && length($0) <= 12' |  tr '[:upper:]' '[:lower:]'  | tr -d 'aeiouy' | cut -c1-4 | sort -u | /usr/lib/locate/frcode | gzip -9 > words_no_plural_len_5_12_no_vowels_lowercase_chars_1_4_frcode.gz
grep -v "'s"'$' words.txt | awk 'length($0)>=6 && length($0) <= 11' |  tr '[:upper:]' '[:lower:]'  | tr -d 'aeiouy' | tr -dc '[:lower:]\n' | cut -c3- | sort -u | /usr/lib/locate/frcode | gzip -9 > words_no_plural_len_6_11_no_vowels_lowercase_chars_3_end_frcode.gz

# manually create my propietary archive format to be fed as input
# excuse my use of those temporary files, I was running out of time for the submission
 ( 
	zcat words_no_plural_len_6_11_no_vowels_lowercase_chars_3_end_frcode.gz > a; 
	zcat words_no_plural_len_5_12_no_vowels_lowercase_chars_1_4_frcode.gz > b; 
	echo '[["d1",'$(wc -c < a)'],["d2",'$(wc -c < b)']]' > d; 
	echo -ne '\x00JSONARCHIVE\x00\x1e\x00\x00\x00'; 
	cat d a b 
	) | gzip > data.gz