# -*- coding: utf-8 -*-
"""
Created on Sun May  8 14:01:20 2016

@author: Vladislav
"""

import datasets
import constants

from probabilitiesTools import calculateHistogramForDataset, printHistogramsComparison

MAX_WORD_LENGTH = 60

limits = [60, 3]

def calculateLettersProbabilitiesForDataset(dataset):
    lettersCount = {}
    lettersProbabilities = {}
    maxProbabilities = {}
    
    for position in range(0, MAX_WORD_LENGTH):
        lettersCount[position] = {}
        lettersProbabilities[position] = {}
        maxProbabilities[position] = 0
        for character in constants.ALLOWED_CHARACTERS:
            lettersCount[position][character] = 0
            lettersProbabilities[position][character] = 0

    print("Calculating letters occurences...")
    
    for word in dataset:
        length = len(word)
        if length <= MAX_WORD_LENGTH:
            for position in range(0, length):
                letter = word[position]
                lettersCount[position][letter] += 1
    
    print("Calculating letters probabilities")        
    
    for position in lettersCount:
        count = 0
        for letter in lettersCount[position]:
            count += lettersCount[position][letter]
            
        if count > 0:
            for letter in lettersCount[position]:
                lettersProbabilities[position][letter] = lettersCount[position][letter] / count
                maxProbabilities[position] = max(maxProbabilities[position],
                  lettersProbabilities[position][letter])

    for position in lettersProbabilities:
        for letter in lettersProbabilities[position]:
            if maxProbabilities[position] > 0:
                lettersProbabilities[position][letter] /= maxProbabilities[position]
    return lettersProbabilities
    
def calculateWordProbability(lettersProbabilities, lettersLimit, word):
    probability = 1.0
    for position in range(0, min(lettersLimit,len(word))):
        letter = word[position]
        value = lettersProbabilities[position][letter]
        probability *= value            
    return probability
    
PROBABILITY_THRESHOLDS = [0.0001, 0.0005, 0.001, 0.005, 0.01, 0.1, 0.2]
dataset = datasets.loadTrainingPositiveDatasetFromFile()
lettersProbabilities = calculateLettersProbabilitiesForDataset(dataset)

def wordProbabilityClassifier(lettersProbabilities, word, lettersLimit = 3):
    probability = calculateWordProbability(lettersProbabilities,
                                           lettersLimit,
                                           word)
    return [probability]

def getLettersProbabilities():
    return lettersProbabilities
            
def wordProbabilityFeature(word):
    result = []
    for limit in limits:
        result.extend(wordProbabilityClassifier(lettersProbabilities, word, lettersLimit = limit))
    return result
    
if __name__ == "__main__":
    
    for limit in limits:
        print("For limit " + str(limit))
        print("Calculating probabilities for positive dataset...")
        histogram1 = calculateHistogramForDataset(dataset, lettersProbabilities, PROBABILITY_THRESHOLDS, wordProbabilityClassifier, limit)
        
        datasetNeg = datasets.loadTrainingNegativeDatasetFromFile()
        print("Calculating probabilities for negative dataset...")
        histogram2 = calculateHistogramForDataset(datasetNeg, lettersProbabilities, PROBABILITY_THRESHOLDS, wordProbabilityClassifier, limit)
        
        printHistogramsComparison(dataset, datasetNeg, histogram1, histogram2)

    print("Done")