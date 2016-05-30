# -*- coding: utf-8 -*-
"""
Created on Sat Apr 30 09:53:41 2016

@author: Vladislav
"""

from constants import VOWELS, CONSONANTS, PAIRS, ALLOWED_CHARACTERS_WITHOUT_APOSTROPHES, LETTERS_SORTED_BY_OCCURENCE_DESC
from lettersPositionsDistance import wordPositionsDistanceFeature
from lettersProbabilities import wordProbabilityFeature
from lettersProbabilitiesReverse import wordProbabilityReverseFeature


def wordLengthFeature(word):
    return [len(word)]
    
def consonantsMinusVowelsFeature(word):
    vowelsQuantity = 0
    consonantsQuantity = 0
    for character in word:
        if character in VOWELS:
            vowelsQuantity += 1
        else:
            if character in CONSONANTS:
                consonantsQuantity += 1
    return [consonantsQuantity - vowelsQuantity]
    
PAIRS_IN_WORD_SOURCE = {pair: 0 for pair in PAIRS}
def pairsFeature(word):

    pairsInWord = PAIRS_IN_WORD_SOURCE.copy()
    
    for i in range(0, len(word)-1):
        pair = word[i:i+2]
        if pair[0] != "'":
            pairsInWord[pair] += 1

    features = [pairsInWord[pair] for pair in PAIRS ]
    
    return features

def apostropheFeature(word):
    if word.endswith("'s"):
        return [1]
    else:
        return [0]

def firstLetterFeature(word):
    return [LETTERS_SORTED_BY_OCCURENCE_DESC.index(word[0])]
    
def lastLetterFeature(word):
    return [LETTERS_SORTED_BY_OCCURENCE_DESC.index(word[len(word)-1])]
    
def firstVowelFeature(word):
    
    for i in range(0, len(word)):
        if word[i] in VOWELS:
            return [VOWELS.index(word[i])]
    return [-1]
    
def firstConsonantFeature(word):
            
    for i in range(0, len(word)):
        if word[i] in CONSONANTS:
            return [CONSONANTS.index(word[i])]
    return [-1]
    
def lastVowelFeature(word):

    for i in range(len(word)-1, -1, -1):
        if word[i] in VOWELS:
            return [VOWELS.index(word[i])]
            
    return [-1]
    
def lastConsonantFeature(word):

    for i in range(len(word)-1, -1, -1):
        if word[i] in CONSONANTS:
            return [CONSONANTS.index(word[i])]
            
    return [-1]
    
def consonantsInARowFeature(word):
    maxConsonantsInARow = 0
    currentConsonantsInARow = 0
    
    for letter in word:
        if letter in CONSONANTS:
            currentConsonantsInARow += 1
            maxConsonantsInARow = max(maxConsonantsInARow, currentConsonantsInARow)
        else:
            currentConsonantsInARow = 0
    return [maxConsonantsInARow]
    
def consonantsCenterFeature(word):
    positionsSum = 0
    consonantsQuantity = 0
    
    for i in range(0, len(word)):
        letter = word[i]
        if letter in CONSONANTS:
            positionsSum += i+1
            consonantsQuantity += 1
            
    if consonantsQuantity == 0:
        value = 0
    else:
        value = int(round(positionsSum*2/consonantsQuantity)) - len(word)
    return [value]
    
def lettersFeature(word):
    letters = [0 for letter in ALLOWED_CHARACTERS_WITHOUT_APOSTROPHES]
    
    for letter in word:
        if letter != '\'':
            letters[ALLOWED_CHARACTERS_WITHOUT_APOSTROPHES.index(letter)] += 1
    return letters
    

ALL_FEATURES = [wordLengthFeature, consonantsMinusVowelsFeature,
                wordProbabilityFeature, wordProbabilityReverseFeature,
                apostropheFeature, firstLetterFeature, lastLetterFeature,
                firstVowelFeature, firstConsonantFeature,
                lastVowelFeature, lastConsonantFeature,
                consonantsInARowFeature, consonantsCenterFeature,
                lettersFeature]

TEST_FEATURES = [wordLengthFeature, consonantsMinusVowelsFeature, apostropheFeature, 
                consonantsInARowFeature, lettersFeature, #pairsFeature,
                wordProbabilityFeature, wordProbabilityReverseFeature,
                wordPositionsDistanceFeature]

def calcFeatures(word, features):
    featuresForThisWord = []
    
    for feature in features:
        allFeatures = feature(word)

        featuresForThisWord.extend(allFeatures)
    return featuresForThisWord