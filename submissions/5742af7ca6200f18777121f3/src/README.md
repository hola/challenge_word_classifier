# Info

Hi! so, my version tries to verify the word by checking some rules that are applied on the english words mixed with frequency analisys.
mine is not the best because it gives a lot of false positive on almost-words due the similarity to a real word.

i tested my code against the SCOWL dictionary and gives `9.26%` of failure,  against the debian british dictionary with `7.00%` of failure meanwhile against the public testcase generator it fails between `30/50%` (it's a lot. i know).

the code itself is just `35459 bytes` (not minified) and minified `26911 bytes`.

# My approach
Ok, i tested the word in this way:

* if the length is less then 4 then there is a small set of valid words.
* if the word is one of the most common ones.
* with a point based tests:
  * it checks if the first, second, third letters are one of the most frequent ones for each category.
  * it checks if the last letter is one of the most frequent ones.
  * it checks if there is an `e` and if there is if the next one is a known letter to be after an `e`.
  * it checks if there is a `p` and if there is if the next one is a known letter to be after an `p`.
  * it checks if there are doubles like `ff`, `ll`, etc. and for some special doubles and a known letter, like `lly` and `cch`.
  * it checks if there are known bigrams like `th`, `he`, `an`, `in`, etc.
  * it checks if there are known trigrams `ion`, `tio`, `for`, etc.
  * it checks if begins with a known `prefix`.
  * it checks if has a known `affix`.
  * it checks if ends with a known `suffix`.
  * it checks if begins with a known `medic prefix`.
  * it checks if has a known `medic affix`.
  * it checks if ends with a known `medic suffix`.

# End

that's all.

