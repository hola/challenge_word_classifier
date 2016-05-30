# -*- coding: utf-8 -*-
"""
Created on Sat Apr 30 18:22:11 2016

@author: Vladislav
"""

import time

import numpy as np
from sklearn.ensemble import AdaBoostClassifier
from sklearn.tree import DecisionTreeClassifier

import datasets
import features


def constructWeightsForPositiveSamples(labels, weightForPositive):
    return np.array([weightForPositive if label == 1 else 1 for label in labels])

models = {}

FIT = "fit"
SAVE_FITTED_MODEL = "save"

def addModel(name, fitFunction, saveFunction):
    models[name] = {}
    models[name][FIT] = fitFunction
    models[name][SAVE_FITTED_MODEL] = saveFunction

# AdaBoost with decision trees
ADABOOST_DECISION_TREES_MODEL = "adaboost_decision_trees"
def fitAdaboost(features, labels, weights):
    
    algorithmToUse = "SAMME.R" # for discrete  classifiers
    weakClassifier = DecisionTreeClassifier(max_depth=5)
    
    adaBoost = AdaBoostClassifier(weakClassifier,
                         algorithm = algorithmToUse,
                         n_estimators=1,
                         learning_rate=1.0)
                       
    adaBoost.fit(features, labels, weights)

    return adaBoost
                
def getTreeJson(tree):
        left = tree.tree_.children_left
        right = tree.tree_.children_right
        threshold = tree.tree_.threshold
        features = tree.tree_.feature
        value = tree.tree_.value

        def recurse(left, right, threshold, features, node):
            subTreeJson = {}
            
            if threshold[node] != -2: # if current node is not a leaf
                subTreeJson["f"] = int(features[node]) # feature
                subTreeJson["le"] = threshold[node] # less or equal
                if left[node] != -1:
                    
                    # left
                    subTreeJson["l"] = \
                      recurse (left, right, threshold, features,left[node])
                    if right[node] != -1:
                        # right
                        subTreeJson["r"] = \
                          recurse (left, right, threshold, features,right[node])
            else: # if current node is a leaf
                subTreeJson[0] = value[node][0][0] # class 0 probability
                subTreeJson[1] = value[node][0][1] # class 1 probability
            return subTreeJson

        return recurse(left, right, threshold, features, 0)
        
def getDecisionTrees(adaBoost):
    estimators = adaBoost.estimators_
    estimatorWeights = adaBoost.estimator_weights_
    
    estimatorsList = []
    for i in range(0, len(estimators)):
        estimatorEntry = {}
        estimatorEntry["w"] = estimatorWeights[i] # weight

        estimator = estimators[i]
        estimatorEntry["t"] = getTreeJson(estimator) #tree
        
        estimatorsList.append(estimatorEntry)    
    return estimatorsList
    
def saveAdaboost(trainedModel):
    datasets.saveDatasetPickle(trainedModel, "resultModel.txt")
    print("Writing decision trees to file...")
    decisionTrees = getDecisionTrees(trainedModel)
    datasets.saveDatasetJson(decisionTrees, "resultDecisionTrees.txt")
    print("Features importance: " + str(trainedModel.feature_importances_))
    
    outliers = datasets.loadDatasetJson("outliers.txt")
    featuresUsed = [feature.__name__ for feature in features.TEST_FEATURES]
    data = {"outliers": outliers, "featuresUsed": featuresUsed, "decisionTrees": decisionTrees}
    
    datasets.saveDatasetJson(data, "data.txt")
###

def fitModel(name, features, labels, weights):
    return models[name][FIT](features, labels, weights)

def saveModel(name, model):
    models[name][SAVE_FITTED_MODEL](model)

addModel(ADABOOST_DECISION_TREES_MODEL, fitAdaboost, saveAdaboost)

MODEL_TO_USE = ADABOOST_DECISION_TREES_MODEL


print("Loading features...")

featuresForSamples = datasets.loadFeatures()

print("Samples: " + str(featuresForSamples.shape[0]))

print("Loading labels...")
labels = datasets.loadLabels()

positivePartInActualDataset = 0.5
negativePartInActualDataset = 1.0 - positivePartInActualDataset

positiveSamples = len(datasets.loadTrainingPositiveDatasetFromFile())
negativeSamples = len(datasets.loadTrainingNegativeDatasetFromFile())
positiveWeight = negativeSamples * negativePartInActualDataset * 1.0 /  \
 (positiveSamples * positivePartInActualDataset)
 
print("Positive weight :" + str(positiveWeight))

weights = constructWeightsForPositiveSamples(labels, positiveWeight)

print("Training model...")
start = time.time()

trainedModel = fitModel(MODEL_TO_USE, featuresForSamples, labels, weights)

end = time.time()
print("Completed in " + str(end-start))
    
print("Writing model to file...")
saveModel(MODEL_TO_USE, trainedModel)


print("Done")