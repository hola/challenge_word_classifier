# Short description
'minify.js' expects 'words.txt' to be in the current working directory. It looks through all words in the dictionary and adds words to the new dictionary, adding only those words that are less than certain percent similar to any of already existing words in that new dictionary.

'solution.js' compares each word it is given to the dictionary and returns 'true' if the word is more than certain percent similar to any of the words in the dictionary.