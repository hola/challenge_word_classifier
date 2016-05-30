# -*- coding: utf-8 -*-
"""
Created on Mon May  2 14:49:32 2016

@author: Vladislav
"""

import datasets
import features
from scipy import sparse

def calculateFeaturesAndLabelsForDatasets():
    
    trainingPositiveDataset = datasets.loadTrainingPositiveDatasetFromFile()
    trainingNegativeDataset = datasets.loadTrainingNegativeDatasetFromFile()

    print("Generating labels...")
    labels = [1] * len(trainingPositiveDataset)
    labels.extend([0] * len(trainingNegativeDataset))
    
    featuresToUse = features.TEST_FEATURES
    
    testFeatures = features.calcFeatures(trainingPositiveDataset[0], featuresToUse)
    print(testFeatures)
    samplesQuantity = len(trainingPositiveDataset) + len(trainingNegativeDataset)
    featuresQuantity = len(testFeatures)
    print("Total samples: " + str(samplesQuantity))
    print("Features quantity: " + str(featuresQuantity))
    
    print("Creating LIL sparse matrix for features...")
    
    featuresForSamples = sparse.lil_matrix((samplesQuantity, featuresQuantity))

    """featuresForSamples[0] = testFeatures[:]
    
    print("Features list: " + str(testFeatures))
    print("Test features in numpy array: " + str(featuresForSamples[0]))"""
    
    currentSample = 0
    print("Calculating features for positive data...")
    for word in trainingPositiveDataset:
        featuresForSamples[currentSample] = features.calcFeatures(word, features.TEST_FEATURES)[:]
        currentSample += 1
    
    print("Calculating features for negative data...")
    for word in trainingNegativeDataset:
        featuresForSamples[currentSample] = features.calcFeatures(word, features.TEST_FEATURES)[:]
        currentSample += 1
        
    print("Converting LIL sparse matrix to CSR sparse matrix...")
    featuresForSamplesSparse = sparse.csr_matrix(featuresForSamples)
    return featuresForSamplesSparse, labels
    

(featuresForSamples, labels) = calculateFeaturesAndLabelsForDatasets()

print("Saving features to file...")
datasets.saveFeatures(featuresForSamples)

print("Saving labels to file...")

datasets.saveLabels(labels)
