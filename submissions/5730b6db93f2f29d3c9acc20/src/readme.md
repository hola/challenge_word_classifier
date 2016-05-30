# Solution to work classifing problem

The problem is described here: https://github.com/hola/challenge_word_classifier

## The Goal

Determine whether given word is an existing English word.

## Algorythm

Build list of bigrams, that only appear (or does not appear, depending on which option is shorter) in the whole dictionary for each position in word.

Go over given word char by char. For each pair of char determine whether it's allowed for current position.

If the check passed, combine pair of bigrams that are allowed to appear and find them in bigram sequence table, so we have tetragrams).

Return true only if there were no restricted bigrams pair.

## Results

69 out of 100
