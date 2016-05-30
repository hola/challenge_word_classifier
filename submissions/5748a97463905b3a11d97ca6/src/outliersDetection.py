# -*- coding: utf-8 -*-
"""
Created on Sat Apr 30 11:46:56 2016

@author: Vladislav
"""

"""TODO: draw histograms for each outlier type, determine optimal thresholds"""

import json
import operator

from constants import VOWELS, CONSONANTS, PAIRS, CONSONANTS_PAIRS, TRIPLETS, QUADS, LAST_PAIRS

LENGTH_OUTLIERS = "length"
PAIRS_OUTLIERS = "pairs"
CONSONANTS_PAIRS_OUTLIERS = "consonants_pairs"
TRIPLETS_OUTLIERS = "triplets"
QUADS_OUTLIERS = "quads"
APOSTROPHE_OUTLIERS = "apostrophe"
CONSONANTS_MINUS_VOWELS_OUTLIERS = "consonants_minus_vowels"
CONSONANTS_CENTER_OUTLIERS = "consonants_center"
CONSONANTS_IN_A_ROW_OUTLIERS = "consonants_in_a_row"
LAST_PAIR_OUTLIERS = "last_pair"
PAIR_BEFORE_APOSTROPHE_OUTLIERS = "pair_before_apostrophe"
CONSONANTS_IN_THE_BEGIN = "consonants_in_the_begin"
CONSONANTS_IN_THE_END = "consonants_in_the_end"

outliersTypesToUse = [LENGTH_OUTLIERS,
                      APOSTROPHE_OUTLIERS,
                      PAIRS_OUTLIERS,
                      #CONSONANTS_PAIRS_OUTLIERS,
                      #CONSONANTS_MINUS_VOWELS_OUTLIERS,
                      TRIPLETS_OUTLIERS,
                      #QUADS_OUTLIERS,
                      #CONSONANTS_CENTER_OUTLIERS,
                      #CONSONANTS_IN_A_ROW_OUTLIERS,
                      LAST_PAIR_OUTLIERS,
                      #PAIR_BEFORE_APOSTROPHE_OUTLIERS,
                      #CONSONANTS_IN_THE_BEGIN,
                      #CONSONANTS_IN_THE_END
                      ]

outliersTypes = {}

OUTLIERS_DETECTOR = "detector"
OUTLIERS_CLASSIFIER = "classifier"
OUTLIERS_CLASSES = "classes"
OUTLIERS_MINIMAL_NON_OUTLIER_VALUE = "threshold"

AVERAGE_WORD_LENGTH = 11

# Considering that there are much more classes that outliers types, so we can 
# evaluate only per class and get quite good estimation
def calcSpaceConsumptionInTermsOfWords(className):
    spaceConsumption = len("\\" + str(className) + "\\: [],")
    spaceConsumptionInTermsOfWords = spaceConsumption / AVERAGE_WORD_LENGTH
    
    return spaceConsumptionInTermsOfWords

def getFlatUsefulness(usefulness):
    flatUsefulness = {}
    
    for outliersType in usefulness:
        for outliersClass in usefulness[outliersType]:
            flatUsefulness[(outliersType, outliersClass)] = usefulness[outliersType][outliersClass]
            
    return flatUsefulness
    
def getSortedFlatUsefulness(flatUsefulness):
        
    sortedFlatUsefulness = sorted(list(flatUsefulness),
 key = flatUsefulness.__getitem__, reverse = True)
    return sortedFlatUsefulness
    
def getSortedUsefulness(usefulness):
    sortedUsefulness = {}
    
    for outliersType in usefulness:
        sortedUsefulness[outliersType] = sorted(list(usefulness[outliersType]),
 key = usefulness[outliersType].__getitem__, reverse = True)
    return sortedUsefulness    
    
def calcOutliersPriorities(usefulness):
    flatUsefulness = getFlatUsefulness(usefulness)

    sortedFlatUsefulness = getSortedFlatUsefulness(flatUsefulness)
    
    return sortedFlatUsefulness
    
def constructOutliersSet(maxOutliersToWrite, outliersPriorities, positiveOutliersQuantities, negativeOutliersQuantities):
    currentlyWrittenOutliers = 0
    outliersSet = {}
    
    for typeAndClass in outliersPriorities:
        outliersType = typeAndClass[0]
        outliersClass = typeAndClass[1]
        
        if outliersType not in positiveOutliersQuantities or outliersClass not in positiveOutliersQuantities[outliersType]:
            positiveQuantity = 0
        else:
            positiveQuantity = positiveOutliersQuantities[outliersType][outliersClass]

        positiveQuantity += calcSpaceConsumptionInTermsOfWords(outliersClass)
        
        if currentlyWrittenOutliers + positiveQuantity <= maxOutliersToWrite:
            if outliersType not in outliersSet:
                outliersSet[outliersType] = {}
            
            outliersSet[outliersType][outliersClass] = []
            
            currentlyWrittenOutliers += positiveQuantity
            
    return outliersSet
    

def addOutlierType(name, outlierClassesDetector, classifier, classes, minNonOutlierValue):
    outliersType = {OUTLIERS_DETECTOR: outlierClassesDetector,
                    OUTLIERS_CLASSIFIER: classifier,
                    OUTLIERS_CLASSES: classes,
                    OUTLIERS_MINIMAL_NON_OUTLIER_VALUE: minNonOutlierValue}
    outliersTypes[name] = outliersType
    
def calcHistogram(dataset, classifier, classes):
    histogram = {}
    for value in classes:
        histogram[value] = 0
        
    for word in dataset:
        wordClasses = classifier(word)
        for wordClass in wordClasses:
            histogram[wordClass] = (histogram[wordClass] + 1) if wordClass in histogram else 1

    print("Histogram: " + str(histogram))
    
    return histogram


def calcHistogramOutliers(histogram, minNonOutlierValue):
    total = 0
    filteredOut = 0
    outliersClasses = []
    
    for value in histogram:
        quantity = histogram[value]
        if quantity < minNonOutlierValue:
            outliersClasses.append(value)
            filteredOut += quantity
        total += quantity
        
    print("Outliers: " + str(filteredOut) + " (" + str(filteredOut*100/total) + "% of dataset)")
    print(str(len(outliersClasses)*100/len(histogram)) + "% of categories")
    return outliersClasses 

def detectOutliersByHistogram(dataset, classifier, classes, minNonOutlierValue):
    return calcHistogramOutliers(calcHistogram(dataset, classifier, classes), minNonOutlierValue)
    
def extractOutliers(dataset, classifier, outliersClasses):
    outliers = {}
    
    for outlierClass in outliersClasses:
        outliers[outlierClass] = []
        
    datasetWithoutOutliers = []
        
    for word in dataset:
        needToAdd = True
        wordClasses = classifier(word)
        for wordClass in wordClasses:
            if wordClass in outliers:
                outliers[wordClass].append(word)
                needToAdd = False
                break
        if needToAdd:
            datasetWithoutOutliers.append(word)
    dataset.clear()
    dataset.extend(datasetWithoutOutliers)
    return outliers

def removeOutliers(dataset, outliersByTypes):
   statistics = {}
   for outliersType in outliersByTypes:
       statistics[outliersType] = 0
   
   print("Excluding outliers from negative dataset...")

   datasetWithoutOutliers = []

   for word in dataset:
       if not checkIfOutlier(outliersTypesToUse,
                             outliersByTypes,
                             word, statistics):
            datasetWithoutOutliers.append(word)

   sortedStatistics = sorted(statistics.items(), key=operator.itemgetter(1))
   sortedStatistics = sortedStatistics[::-1]
   
   print("Outliers types statistics: ")
   for item in sortedStatistics:
       print(str(item[0]) + ": " + str(item[1]))
   print("Dataset size is " + str(len(datasetWithoutOutliers)))
   print(str((len(dataset) - len(datasetWithoutOutliers))*100 / len(dataset)) + " % excluded")
   return datasetWithoutOutliers

def calculateOutliersUsefulnessAndPositiveOccurences(positiveDataset, negativeDataset):
    
   statistics = {}
   positiveStatistics = {}
   negativeStatistics = {}
   
   for outliersType in outliersTypesToUse:
       statistics[outliersType] = {}
       positiveStatistics[outliersType] = {}
       negativeStatistics[outliersType] = {}
       for oneClass in outliersTypes[outliersType][OUTLIERS_CLASSES]:
           statistics[outliersType][oneClass] = 0
           positiveStatistics[outliersType][oneClass] = 0
           negativeStatistics[outliersType][oneClass] = 0
   
   print("Calculating classes in negative dataset...")

   for word in negativeDataset:
       detectAllOutliers(outliersTypesToUse,
                         word,
                         negativeStatistics)
   print("Calculating classes in positive dataset...")
   for word in positiveDataset:
       detectAllOutliers(outliersTypesToUse,
                         word,
                         positiveStatistics)
                         
   print("Calculating usefulness...")
   for outliersType in outliersTypesToUse:
       for oneClass in outliersTypes[outliersType][OUTLIERS_CLASSES]:
           spaceConsumptionInTermsOfWords = calcSpaceConsumptionInTermsOfWords(oneClass)
           if positiveStatistics[outliersType][oneClass] != 0:    
               statistics[outliersType][oneClass] = (negativeStatistics[outliersType][oneClass] +
                 positiveStatistics[outliersType][oneClass]) / \
                 (positiveStatistics[outliersType][oneClass] + spaceConsumptionInTermsOfWords)
           else:
               statistics[outliersType][oneClass] = \
                 negativeStatistics[outliersType][oneClass] / spaceConsumptionInTermsOfWords
   return statistics, positiveStatistics, negativeStatistics

# Lengths
LENGTHS_MORE_THAN_60 = ">60"
LENGTHS_CLASSES = list(range(0,61))
LENGTHS_CLASSES.append(LENGTHS_MORE_THAN_60)
def lengthsClassifier(word):
    length = len(word)
    if length <= 60:
        return [len(word)]
    else:
        return [LENGTHS_MORE_THAN_60]
    
def detectLengthsOutliers(dataset, classes, minNonOutlierValue):
    return detectOutliersByHistogram(dataset, lengthsClassifier, classes, minNonOutlierValue)
    
###

# Pairs
def pairsClassifier(word):
    detectedPairs = set()

    for i in range(0, len(word)-1):
        pair = word[i:i+2]
        if pair[0] != "'":
            detectedPairs.add(pair)
    
    return detectedPairs

def detectPairsOutliers(dataset, classes, minNonOutlierValue):
    return detectOutliersByHistogram(dataset, pairsClassifier, classes, minNonOutlierValue)
###


# Consonants pairs
def consonantsPairsClassifier(word):
    detectedPairs = set()
    consonantsWordList = [letter for letter in word if letter in CONSONANTS]
    consonantsWord = "".join(consonantsWordList)

    for i in range(0, len(consonantsWord)-1):
        detectedPairs.add(consonantsWord[i:i+2])
    
    return detectedPairs

def detectConsonantsPairsOutliers(dataset, classes, minNonOutlierValue):
    return detectOutliersByHistogram(dataset, consonantsPairsClassifier, classes, minNonOutlierValue)
###
    
# Triplets
def tripletsClassifier(word):
    detectedTriplets = set()

    for i in range(0, len(word)-2):
        detectedTriplets.add(word[i:i+3])
    
    return detectedTriplets

def detectTripletsOutliers(dataset, classes, minNonOutlierValue):
    return detectOutliersByHistogram(dataset, tripletsClassifier, classes, minNonOutlierValue)
###
    
# Triplets
def quadsClassifier(word):
    detectedQuads = set()

    for i in range(0, len(word)-3):
        detectedQuads.add(word[i:i+4])
    
    return detectedQuads

def detectQuadsOutliers(dataset, classes, minNonOutlierValue):
    return detectOutliersByHistogram(dataset, quadsClassifier, classes, minNonOutlierValue)
###
    
# Consonants center
CONSONANT_CENTERS_MORE_THAN_5 = ">5"
CONSONANT_CENTERS_LESS_THAN_MINUS_3 = "<-3"
CONSONANT_CENTERS = list(range(-4, 6))
CONSONANT_CENTERS.append(CONSONANT_CENTERS_MORE_THAN_5)
CONSONANT_CENTERS.append(CONSONANT_CENTERS_LESS_THAN_MINUS_3)
CONSONANT_CENTERS.append(None)
def consonantsCenterClassifier(word):
    positionsSum = 0
    consonantsQuantity = 0
    
    for i in range(0, len(word)):
        letter = word[i]
        if letter in CONSONANTS:
            positionsSum += i+1
            consonantsQuantity += 1
            
    if consonantsQuantity == 0:
        return [None]
    else:
        value = int(round(positionsSum*2/consonantsQuantity)) - len(word)
        if value > 5:
            className = CONSONANT_CENTERS_MORE_THAN_5
        else:
            if value <-3:
                className = CONSONANT_CENTERS_LESS_THAN_MINUS_3
            else:
                className = value
        return [className]

def detectConsonantsCenterOutliers(dataset, classes, minNonOutlierValue):
    return detectOutliersByHistogram(dataset, consonantsCenterClassifier, classes, minNonOutlierValue)
###
    
# Consonants in a row
CONSONANTS_IN_A_ROW_MORE_THAN_6 = ">6"
CONSONANTS_IN_A_ROW_CLASSES = list(range(0,7))
CONSONANTS_IN_A_ROW_CLASSES.append(CONSONANTS_IN_A_ROW_MORE_THAN_6)
def consonantsInARowClassifier(word):
    maxConsonantsInARow = 0
    currentConsonantsInARow = 0
    
    for letter in word:
        if letter in CONSONANTS:
            currentConsonantsInARow += 1
            maxConsonantsInARow = max(maxConsonantsInARow, currentConsonantsInARow)
        else:
            currentConsonantsInARow = 0
        
    if maxConsonantsInARow <= 6:
        return [maxConsonantsInARow]
    else:
        return [CONSONANTS_IN_A_ROW_MORE_THAN_6]
    
def detectConsonantsInARowOutliers(dataset, classes, minNonOutlierValue):
    return detectOutliersByHistogram(dataset, consonantsInARowClassifier, classes, minNonOutlierValue)
    
###
    
# Consonants in the begin
CONSONANTS_IN_THE_BEGIN_MORE_THAN_5 = ">5"
CONSONANTS_IN_THE_BEGIN_CLASSES = list(range(0,6))
CONSONANTS_IN_THE_BEGIN_CLASSES.append(CONSONANTS_IN_THE_BEGIN_MORE_THAN_5)
def consonantsInTheBeginClassifier(word):
    consonants = 0
    
    for letter in word:
        if letter in CONSONANTS:
            consonants += 1
        else:
            break

    if consonants <= 5:
        return [consonants]
    else:
        return [CONSONANTS_IN_THE_BEGIN_MORE_THAN_5]
    
def detectConsonantsInTheBeginOutliers(dataset, classes, minNonOutlierValue):
    return detectOutliersByHistogram(dataset, consonantsInTheBeginClassifier, classes, minNonOutlierValue)
    
###
    
# Consonants in the end
CONSONANTS_IN_THE_END_MORE_THAN_5 = ">5"
CONSONANTS_IN_THE_END_CLASSES = list(range(0,6))
CONSONANTS_IN_THE_END_CLASSES.append(CONSONANTS_IN_THE_END_MORE_THAN_5)
def consonantsInTheEndClassifier(word):
    consonants = 0
    word = word[::-1]
    
    for letter in word:
        if letter in CONSONANTS:
            consonants += 1
        else:
            break

    if consonants <= 5:
        return [consonants]
    else:
        return [CONSONANTS_IN_THE_BEGIN_MORE_THAN_5]
    
def detectConsonantsInTheEndOutliers(dataset, classes, minNonOutlierValue):
    return detectOutliersByHistogram(dataset, consonantsInTheEndClassifier, classes, minNonOutlierValue)
    
###
    
# Last pair
LAST_PAIR_CLASSES = LAST_PAIRS
LAST_PAIR_CLASSES.append(None)
def lastPairClassifier(word):
    if len(word) < 2:
        return [None]
    else:
        lastTwoLetters = word[-2:]
        if lastTwoLetters == "'s":
            if len(word) < 4:
                lastTwoLetters = None
            else:
                lastTwoLetters = word[-4:-2]
        
        if lastTwoLetters is not None and "'"in lastTwoLetters:
            lastTwoLetters = None            
        else:
            return [word[-4:-2]]
        return [lastTwoLetters]
    
def detectLastPairOutliers(dataset, classes, minNonOutlierValue):
    return detectOutliersByHistogram(dataset, lastPairClassifier, classes, minNonOutlierValue)
    
###
    
# Pair before apostrophe
PAIR_BEFORE_APOSTROPHE_CLASSES = LAST_PAIRS
PAIR_BEFORE_APOSTROPHE_CLASSES.append(None)
def pairBeforeApostropheClassifier(word):
    if len(word) < 4:
        return [None]
    else:
        lastTwoLetters = word[-2:]
        if lastTwoLetters == "'s":
            return [word[-4:-2]]
        else:
            return [None]
    
def detectPairBeforeApostropheOutliers(dataset, classes, minNonOutlierValue):
    return detectOutliersByHistogram(dataset, pairBeforeApostropheClassifier, classes, minNonOutlierValue)
    
###
    
# Apostrophe
WITHOUT_APOSTROPHE = "no"
ONE_APOSTROPHE_AND_S_AFTER_AT_END = "one_plus_s_in_end"
MORE_THAN_ONE_APOSTROPHE_OR_DOESNT_END_WITH_S = "many_or_not_s_in_end"

APOSTROPHE_CLASSES = [WITHOUT_APOSTROPHE, ONE_APOSTROPHE_AND_S_AFTER_AT_END,
                      MORE_THAN_ONE_APOSTROPHE_OR_DOESNT_END_WITH_S]

def apostropheClassifier(word):
    apostrophesQuantity = word.count("'")
    if apostrophesQuantity == 0:
        return [WITHOUT_APOSTROPHE]
    else:
        if apostrophesQuantity == 1:
            if word.endswith("'s"):
                return [ONE_APOSTROPHE_AND_S_AFTER_AT_END]
    return [MORE_THAN_ONE_APOSTROPHE_OR_DOESNT_END_WITH_S]

def detectApostropheOutliers(dataset, classes, minNonOutlierValue):
    return detectOutliersByHistogram(dataset, apostropheClassifier, classes, minNonOutlierValue)                    
###
    
# Consonants minus vowels
CONSONANTS_MINUS_VOWELS_MORE_THAN_9 = ">9"
CONSONANTS_MINUS_VOWELS_LESS_THAN_MINUS_5 = "<-5"
CONSONANTS_MINUS_VOWELS_CLASSES = list(range(-5, 10))
CONSONANTS_MINUS_VOWELS_CLASSES.append(CONSONANTS_MINUS_VOWELS_MORE_THAN_9)
CONSONANTS_MINUS_VOWELS_CLASSES.append(CONSONANTS_MINUS_VOWELS_LESS_THAN_MINUS_5)
def consonantsMinusVowelsClassifier(word):
    consonants = 0
    vowels = 0

    for letter in word:
        if letter in CONSONANTS:
            consonants += 1
        else:
            if letter in VOWELS:
                vowels += 1
    
    value = consonants - vowels
    if value > 9:
        className = CONSONANTS_MINUS_VOWELS_MORE_THAN_9
    else:
        if value <-5:
            className = CONSONANTS_MINUS_VOWELS_LESS_THAN_MINUS_5
        else:
            className = value
    return [className]

def detectConsonantsMinusVowelsOutliers(dataset, classes, minNonOutlierValue):
    return detectOutliersByHistogram(dataset, consonantsMinusVowelsClassifier, classes, minNonOutlierValue)
###
    
    
def detectAndExtractOutliers(dataset, outliersTypesToUse):
    outliersByTypes = {}
    sourceLength = len(dataset)
    for outliersType in outliersTypesToUse:
        detector = outliersTypes[outliersType][OUTLIERS_DETECTOR]
        classifier = outliersTypes[outliersType][OUTLIERS_CLASSIFIER]
        classes = outliersTypes[outliersType][OUTLIERS_CLASSES]
        minNonOutlierValue = outliersTypes[outliersType][OUTLIERS_MINIMAL_NON_OUTLIER_VALUE]
        
        print("Detecting outliers for type " + outliersType + "...")
        outliersClasses = detector(dataset, classes, minNonOutlierValue)
        print("Extracting outliers...")
        outliersByTypes[outliersType] = extractOutliers(dataset, classifier, outliersClasses)
        print("Done\n")
        
        
        
    print("Total size with excluded outliers: " + str(len(dataset)) +
 "(" + str((len(dataset)*100 / sourceLength )) + " % of original dataset)")
 
    return outliersByTypes
    
def extractOutliersByTypes(dataset, outliersByTypes):
    sourceLength = len(dataset)
    for outliersType in outliersByTypes:
        classifier = outliersTypes[outliersType][OUTLIERS_CLASSIFIER]
        
        outliersClasses = outliersByTypes[outliersType].keys()

        print("Extracting outliers...")
        outliersByTypes[outliersType] = extractOutliers(dataset, classifier, outliersClasses)
        print("Done\n")
        
        
        
    print("Total size with excluded outliers: " + str(len(dataset)) +
 "(" + str((len(dataset)*100 / sourceLength )) + " % of original dataset)")
 
    return outliersByTypes

def isTripletOutliersClassRedundant(pairsOutliers, tripletsOutliersClass):
    return tripletsOutliersClass[0:2] in pairsOutliers or tripletsOutliersClass[1:3] in pairsOutliers
    
def isPairAlreadyExcludedAsMultipleApostrophesOrWithoutS(pair):
    return pair[0] == '\'' and pair[1] != 's'

def isTripletAlreadyExcludedAsMultipleApostrophesOrWithoutS(pair):
    # '?? excluded because no 's in the end
    # ?'? excluded if third letter is not s
    return (pair[0] == '\'') or \
           (pair[1] == '\'' and pair[2] != 's')
          
def excludeRedundancyFromOutliersByTypes(outliersByTypes):
    if PAIRS_OUTLIERS in outliersByTypes and TRIPLETS_OUTLIERS in outliersByTypes:
            pairsOutliers = outliersByTypes[PAIRS_OUTLIERS]
            tripletsOutliers = outliersByTypes[TRIPLETS_OUTLIERS]
            
            was = len(outliersByTypes[TRIPLETS_OUTLIERS])
            
            filteredTripletsOutliers = {outliersClass: tripletsOutliers[outliersClass]
              for outliersClass in tripletsOutliers
              if not isTripletOutliersClassRedundant(pairsOutliers, outliersClass)}
            outliersByTypes[TRIPLETS_OUTLIERS] = filteredTripletsOutliers
            
            print("Exclusion of already excluded pairs from triplets: " + \
              str(was) + " -> " + str(len(outliersByTypes[TRIPLETS_OUTLIERS])))
            
    if APOSTROPHE_OUTLIERS in outliersByTypes:
        apostropheOutliers = outliersByTypes[APOSTROPHE_OUTLIERS]
        if MORE_THAN_ONE_APOSTROPHE_OR_DOESNT_END_WITH_S in apostropheOutliers:
            if PAIRS_OUTLIERS in outliersByTypes:
                pairsOutliers = outliersByTypes[PAIRS_OUTLIERS]
                was = len(outliersByTypes[PAIRS_OUTLIERS])
                
                filteredPairsOutliers = {outliersClass: pairsOutliers[outliersClass]
                  for outliersClass in pairsOutliers
                  if not isPairAlreadyExcludedAsMultipleApostrophesOrWithoutS(outliersClass)}
                outliersByTypes[PAIRS_OUTLIERS] = filteredPairsOutliers
                print("Exclusion of already excluded pairs with apostrophes: " + \
                  str(was) + " -> " + str(len(outliersByTypes[PAIRS_OUTLIERS])))
                
            if TRIPLETS_OUTLIERS in outliersByTypes:
                tripletsOutliers = outliersByTypes[TRIPLETS_OUTLIERS]
                was = len(outliersByTypes[TRIPLETS_OUTLIERS])
                
                filteredTripletsOutliers = {outliersClass: tripletsOutliers[outliersClass]
                  for outliersClass in tripletsOutliers
                  if not isTripletAlreadyExcludedAsMultipleApostrophesOrWithoutS(outliersClass)}
                outliersByTypes[TRIPLETS_OUTLIERS] = filteredTripletsOutliers
                print("Exclusion of already excluded triplets with apostrophes: " + \
                  str(was) + " -> " + str(len(outliersByTypes[TRIPLETS_OUTLIERS])))

def getOptimizedOutliersByTypes(outliersByTypes):
    outliersByTypeOptimized = {}
    for outliersType in outliersByTypes:
        outliersByTypeOptimized[outliersType] = set(outliersByTypes[outliersType])
    return outliersByTypeOptimized
                
def checkIfOutlier(outlierTypes, outliersByTypes, word, statistics):
    for outliersType in outlierTypes:
        currentClasses = outliersTypes[outliersType][OUTLIERS_CLASSIFIER](word)
        for oneClass in currentClasses:
            if str(oneClass) in outliersByTypes[outliersType]:
                statistics[outliersType] += 1
                return True
    return False

def detectOutlierTypeAndClass(outlierTypes, outliersByTypes, word):
    for outliersType in outlierTypes:
        currentClasses = outliersTypes[outliersType][OUTLIERS_CLASSIFIER](word)
        for oneClass in currentClasses:
            if str(oneClass) in outliersByTypes[outliersType]:
                return outliersType, oneClass
    return None, None
    
def detectAllOutliers(outlierTypes, word, statistics):
    for outliersType in outlierTypes:
        currentClasses = outliersTypes[outliersType][OUTLIERS_CLASSIFIER](word)
        for oneClass in currentClasses:
            if oneClass in statistics[outliersType]:
                statistics[outliersType][oneClass] += 1
            else:
                statistics[outliersType][oneClass] = 1
        
    
def writeOutliersByTypesToFile(outliersByTypes):
    outliersFile = open("outliers.txt", "w")
    json.dump(outliersByTypes, outliersFile)
    outliersFile.close()
    
def loadOutliersByTypesFromFile():
    outliersFile = open("outliers.txt", "r")
    outliersByTypes = json.load(outliersFile)
    outliersFile.close()    
    
    return outliersByTypes
    
"""
   When we'll lookup for outliers in our dictionary, word should be at least
   in one list of appropriate outliers classes to be outlier.
"""

addOutlierType(LENGTH_OUTLIERS, detectLengthsOutliers, lengthsClassifier, LENGTHS_CLASSES, 100)
addOutlierType(PAIRS_OUTLIERS, detectPairsOutliers, pairsClassifier, PAIRS, 100)
addOutlierType(CONSONANTS_PAIRS_OUTLIERS, detectConsonantsPairsOutliers, consonantsPairsClassifier, CONSONANTS_PAIRS, 10)
addOutlierType(APOSTROPHE_OUTLIERS, detectApostropheOutliers, apostropheClassifier, APOSTROPHE_CLASSES, 402)
addOutlierType(CONSONANTS_MINUS_VOWELS_OUTLIERS, detectConsonantsMinusVowelsOutliers, consonantsMinusVowelsClassifier, CONSONANTS_MINUS_VOWELS_CLASSES, 100)
addOutlierType(TRIPLETS_OUTLIERS, detectTripletsOutliers, tripletsClassifier, TRIPLETS, 3)
addOutlierType(QUADS_OUTLIERS, detectQuadsOutliers, quadsClassifier, QUADS, 3)
addOutlierType(CONSONANTS_CENTER_OUTLIERS, detectConsonantsCenterOutliers, consonantsCenterClassifier, CONSONANT_CENTERS, 100)
addOutlierType(CONSONANTS_IN_A_ROW_OUTLIERS, detectConsonantsInARowOutliers, consonantsInARowClassifier, CONSONANTS_IN_A_ROW_CLASSES, 100)
addOutlierType(LAST_PAIR_OUTLIERS, detectLastPairOutliers, lastPairClassifier, LAST_PAIR_CLASSES, 10)
addOutlierType(PAIR_BEFORE_APOSTROPHE_OUTLIERS, detectPairBeforeApostropheOutliers, pairBeforeApostropheClassifier, PAIR_BEFORE_APOSTROPHE_CLASSES, 5)
addOutlierType(CONSONANTS_IN_THE_BEGIN, detectConsonantsInTheBeginOutliers, consonantsInTheBeginClassifier, CONSONANTS_IN_THE_BEGIN_CLASSES, 70)
addOutlierType(CONSONANTS_IN_THE_END, detectConsonantsInTheEndOutliers, consonantsInTheEndClassifier, CONSONANTS_IN_THE_END_CLASSES, 60)