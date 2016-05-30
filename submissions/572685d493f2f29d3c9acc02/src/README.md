Incoming dictionary was prepared by such steps:

-All words with "'s" are converted to form without "'s"
-Each word are splitted by 3 parts - prefix, body, suffix
-Each prefix and suffix made as substring from original word, with up to 3 length from begin and from end
-Rest of word (named body) are cutted to length 3 from the begin and end (so it will like a wildcards)

 Example
 "body" => ["bod","y",""]
 "suffixes" => ["suf","fi","xes"]
 "combinations" => ["com","binati","ons"] => ["com","ina","ons"] (like a wildcards we allow "com*ina*ons")


3 as length for all three parts are calculated after some iteration as optimal for combination of string length and 
result dictionary file size


-We made 3 dictionaries after steps above
-We move parts from them into 4 additional dictionaries if parts exists in more than one dictionary

So 7 results dictionaries contains unique word parts

-2 additional dictionary contains nonexists in source file 2 and 3-chars combinations


So, in test function we prepare incoming word and break it on 3 parts (like words from source file on preparation steps above).
Each part from testing word must exists in appropriate dictionary:  "prefix" part must be in "prefix","prefix_body","prefix_suffix"
or "prefix_body_suffix" dictionary. It's not a warranty that word IS correct, but it CAN be made based on our dictionaries.

In additional, if source word length less or equal 9 (3 parts by 3 chars max), so such word MUST be equal to the its parts concatenation. We emulate 
"wildcards" on words from length more than 9.


