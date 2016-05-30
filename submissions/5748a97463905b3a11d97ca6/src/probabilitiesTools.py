# -*- coding: utf-8 -*-
"""
Created on Thu May 26 17:39:04 2016

@author: Vladislav
"""

def divider(value, thresholds):
    for threshold in thresholds:
        if value < threshold:
            return "<" + str(threshold)
            
    return ">=" + str(thresholds[-1])

def calculateHistogramForDataset(dataset, lettersProbabilities, PROBABILITY_THRESHOLDS, wordProbabilityClassifier, lettersLimit = None):
    histogram = {}
    
    print("Calculating histogram for limit " + str(lettersLimit))
    
    for key in PROBABILITY_THRESHOLDS:
        histogram["<" + str(key)] = 0
    histogram[">=" + str(PROBABILITY_THRESHOLDS[-1])] = 0
        
    for word in dataset:
        if True:#if len(word) <= MAX_WORD_LENGTH:
            if lettersLimit is not None:
                probability = wordProbabilityClassifier(lettersProbabilities,
                                                        word,
                                                        lettersLimit = lettersLimit)[0]
            else:
                probability = wordProbabilityClassifier(lettersProbabilities,
                                                        word)[0]                
            probabilityClass = [divider(probability, PROBABILITY_THRESHOLDS)]
            if probabilityClass[0] in histogram:
                histogram[probabilityClass[0]] += 1
            else:
                histogram[probabilityClass[0]] = 1
            #if probabilityClass[0] == ">=75":
                #print(word)    
                
    return histogram

def pureUsefulness(positiveQuantity, negativeQuantity, positiveWeight, totalPositive, totalNegative):
    value = (totalNegative - negativeQuantity) / max(1,(totalPositive - positiveQuantity)*positiveWeight)
    value = abs(1.0 - value)
    return "{0:.2f}".format(value*100) + " %"

def printHistogramsComparison(dataset, datasetNeg, histogram1, histogram2):
    positiveWeight = len(datasetNeg) /len(dataset)
    
    keys = histogram1.keys()
    keysSorted = sorted(keys)
    for key in keysSorted:
        print(key + ": P - N " + str(int(histogram1[key]*positiveWeight)) + " - " + str(histogram2[key]) + \
        ", difference, times: " + str("{0:.2f}".format(histogram2[key] / max(1, histogram1[key]*positiveWeight))) + \
        ", u: " + pureUsefulness(histogram1[key], histogram2[key], positiveWeight, len(dataset), len(datasetNeg)))
    