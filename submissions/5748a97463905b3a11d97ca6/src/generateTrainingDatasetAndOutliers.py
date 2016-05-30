# -*- coding: utf-8 -*-
"""
Created on Sat Apr 30 11:09:51 2016

@author: Vladislav
"""

import datasets
import outliersDetection

print("Positive dataset preparation")
positiveDataset = datasets.loadAndPreprocessPositiveDataset()

print("Negative dataset preparation")
negativeDataset = datasets.loadDataset("actualNegativeDataset.txt")
negativeDataset = datasets.removeDuplicates(negativeDataset)

print("Calculating outliers usefulness...")
(outliersUsefulness, positiveOutliersQuantities, negativeOutliersQuantities) = \
 outliersDetection.calculateOutliersUsefulnessAndPositiveOccurences(positiveDataset, negativeDataset)
 
datasets.saveDatasetJson(outliersUsefulness, "classesUsefulness.txt")

print("Calculating outliers priorities...")
outliersPriorities = outliersDetection.calcOutliersPriorities(outliersUsefulness)

print("Constructing outliers list...")
outliersByTypes = outliersDetection.constructOutliersSet(5000, outliersPriorities, positiveOutliersQuantities, negativeOutliersQuantities)

print("Outliers extraction from positive dataset")
outliersDetection.extractOutliersByTypes(positiveDataset, outliersByTypes)

print("Outliers exclusion from negative dataset")
negativeDataset = outliersDetection.removeOutliers(negativeDataset, outliersByTypes)

print("Removing redundancy from outliers...")
outliersDetection.excludeRedundancyFromOutliersByTypes(outliersByTypes)

positiveDatasetAsSet = set(positiveDataset)

print("Writing training positive dataset to file...")
datasets.saveTrainingPositiveDatasetToFile(positiveDataset)

print("Writing training negative dataset to file...")
datasets.saveTrainingNegativeDatasetToFile(negativeDataset)

print("Saving outliers to file...")
outliersDetection.writeOutliersByTypesToFile(outliersByTypes)
