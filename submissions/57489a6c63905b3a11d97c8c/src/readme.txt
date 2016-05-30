## Authors

Hugo Mendes
Hugo St-Arnaud

####

This package is a submission for the hola! JS Challenge Spring 2016: Word Classifier.

Our approch was based on finding patterns that can clearly identify a word not being in the dictionnary. We used various php scripts designed to load and parse the dictionnary. It allowed us to build a regular expression that could match all two letter combos that do not exist in the dictionnary. We did the same for the starting two letters, the ending two letters, impossible two letter combos by word length, impossible two letter combos by starting letters and impossible three letter combos. We chose php because it is a simple way to write very fast scripts that can parse the dictionnary words. The resulting regular expressions were included in our script to test if a given word is certainly not in the dictionnary.