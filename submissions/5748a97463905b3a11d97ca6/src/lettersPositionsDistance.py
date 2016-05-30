# -*- coding: utf-8 -*-
"""
Created on Sun May  8 14:01:20 2016

@author: Vladislav
"""

import datasets
import constants
import math

from probabilitiesTools import calculateHistogramForDataset, printHistogramsComparison

def calculateLettersAveragePositionsForDataset(dataset):
    lettersCount = {}
    lettersAveragePositions = {}
    
    for character in constants.ALLOWED_CHARACTERS:
        lettersCount[character] = 0
        lettersAveragePositions[character] = 0

    print("Calculating letters average positions...")
    
    for word in dataset:
        length = len(word)
        for position in range(0, length):
            letter = word[position]
            relativePosition = position / max(1, length-1)
            lettersCount[letter] += 1
            lettersAveragePositions[letter] += relativePosition      
    
    for letter in lettersCount:
        lettersAveragePositions[letter] /= lettersCount[letter]

    return lettersAveragePositions

def calculateWordDistanceL1FromAverage(lettersAveragePositions, word):
    distance = 0.0
    for position in range(0, len(word)):
        letter = word[position]
        relativePosition = position / max(1, len(word)-1)
        value = relativePosition - lettersAveragePositions[letter]
        distance += abs(value)
    return distance
    
def calculateWordDistanceL2FromAverage(lettersAveragePositions, word):
    distance = 0.0
    for position in range(0, len(word)):
        letter = word[position]
        relativePosition = position / max(1, len(word)-1)
        value = relativePosition - lettersAveragePositions[letter]
        distance += value*value        
    return math.sqrt(distance)
    
PROBABILITY_THRESHOLDS = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.95]
dataset = datasets.loadTrainingPositiveDatasetFromFile()
lettersAveragePositions = calculateLettersAveragePositionsForDataset(dataset)

def wordDistanceClassifier(lettersProbabilities, word):
    distanceL1 = calculateWordDistanceL1FromAverage(lettersProbabilities,
                                           word)
    distanceL2 = calculateWordDistanceL2FromAverage(lettersProbabilities,
                                           word)
    return [distanceL1, distanceL2]

def getLettersAveragePositions():
    return lettersAveragePositions
            
def wordPositionsDistanceFeature(word):
    return wordDistanceClassifier(lettersAveragePositions, word)
    
if __name__ == "__main__":
    
    print("Calculating distances for positive dataset...")
    histogram1 = calculateHistogramForDataset(dataset, lettersAveragePositions, PROBABILITY_THRESHOLDS, wordDistanceClassifier)
    
    datasetNeg = datasets.loadTrainingNegativeDatasetFromFile()
    print("Calculating distances for negative dataset...")
    histogram2 = calculateHistogramForDataset(datasetNeg, lettersAveragePositions, PROBABILITY_THRESHOLDS, wordDistanceClassifier)
    
    printHistogramsComparison(dataset, datasetNeg, histogram1, histogram2)

    print("Done")