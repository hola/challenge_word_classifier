# -*- coding: utf-8 -*-
"""
Created on Fri Apr 30

@author: Vladislav
"""

import json
import pickle

def preprocess(word):
    return word.lower()

def removeDuplicates(dataset):
    
    print("Removing duplicates...")
    wasElements = len(dataset)
    datasetAsSet = set(dataset)
    dataset = list(datasetAsSet)
    print(str(wasElements) + " -> " + str(len(dataset)))
    return dataset
    
def loadDataset(filename):
    datasetFile = open(filename, "r")
    dataset = []

    for line in datasetFile:
        dataset.append(line.strip())
    datasetFile.close()
    
    return dataset
    
def saveDataset(dataset, filename):

    datasetFile = open(filename, "w")

    for line in dataset:
        datasetFile.write(line + "\n")
    
    datasetFile.close()
    
def loadDatasetJson(filename):
    datasetFile = open(filename, "r")

    dataset = json.load(datasetFile)
    datasetFile.close()
    
    return dataset
    
def saveDatasetJson(dataset, filename):
    datasetFile = open(filename, "w")
    
    json.dump(dataset, datasetFile)
    
    datasetFile.close()
    
def loadDatasetPickle(filename):
    dataFile = open(filename, "rb")
    dataset = pickle.load(dataFile)
    dataFile.close()
    return dataset
    
def saveDatasetPickle(dataset, filename):
    dataFile = open(filename, "wb")
    pickle.dump(dataset, dataFile)
    dataFile.close()

def loadAndPreprocessPositiveDataset():

    sourceDataset = loadDataset("words.txt")
    
    print("Source dataset has " + str(len(sourceDataset)) + " elements")
    
    preprocessedPositiveDataset = [preprocess(word) for word in sourceDataset]
    
    preprocessedPositiveDataset = removeDuplicates(preprocessedPositiveDataset)

    return preprocessedPositiveDataset 
    
def saveTrainingPositiveDatasetToFile(dataset):
    saveDataset(dataset, "training_positive_dataset.txt")
    
def loadTrainingPositiveDatasetFromFile():
    
    dataset = loadDataset("training_positive_dataset.txt")    
    
    print("Positive training dataset has " + str(len(dataset)) + " elements")

    return dataset
    
def saveTrainingNegativeDatasetToFile(dataset):
    saveDataset(dataset, "training_negative_dataset.txt")
    
def loadTrainingNegativeDatasetFromFile():
    
    dataset = loadDataset("training_negative_dataset.txt")
    
    print("Negative training dataset has " + str(len(dataset)) + " elements")

    return dataset
    
def loadValidationNegativeDataset():
    dataset = loadDataset("validation_negative.txt")
    print("Validation negative dataset size is " + str(len(dataset)))
    return dataset
    
def saveValidationNegativeDataset(dataset):
    saveDataset(dataset, "validation_negative.txt")
    
def loadLabels():
    return loadDatasetJson("labels.txt")
    
def saveLabels(labels):
    saveDatasetJson(labels, "labels.txt")    
    
def loadFeatures():
    return loadDatasetPickle("features.txt")
    
def saveFeatures(features):
    saveDatasetPickle(features, "features.txt")