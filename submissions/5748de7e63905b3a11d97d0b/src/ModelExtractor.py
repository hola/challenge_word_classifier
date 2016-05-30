__author__ = 'roma'
from collections import Counter
from FeatureExtractors import *

with open('model6.csv','w') as outFile:
    featuresCounter = {}
    featuresCounter[True] = Counter()
    featuresCounter[False] = Counter()
    for line in open('../run/trainO.csv'):
        line = line.replace('\n','')
        if len(line):
            line_split = line.split(',')
            word = line_split[0]
            isENG = line_split[1]

            featuresCounter[isENG == 'True'].update([str(len(word)) + 'wl'])
            featuresCounter[isENG == 'True'].update([str(consonantCountF(word)) + 'cc'])
            featuresCounter[isENG == 'True'].update([str(vowCountF(word)) + 'vc'])
            # featuresCounter[isENG == 'True'].update([str(numberOfZigzags(word)) + 'noz'])
            featuresCounter[isENG == 'True'].update([str(apCountF(word)) + 'ac'])
            featuresCounter[isENG == 'True'].update([str(distSum(word)) + 'ds'])
            if len(word) > 1:
                featuresCounter[isENG == 'True'].update([word[i:i+2] for i in range(0,len(word) - 1)])
            if len(word) > 2:
                featuresCounter[isENG == 'True'].update([word[i:i+3] for i in range(0,len(word) - 2)])
            if len(word) > 3:
                featuresCounter[isENG == 'True'].update([word[i:i+4] for i in range(0,len(word) - 3)])
            if len(word) > 4:
                featuresCounter[isENG == 'True'].update([word[i:i+5] for i in range(0,len(word) - 4)])


    for feat,_ in featuresCounter[True].most_common(6000):
        outFile.write(','.join([str(featuresCounter[True][feat]), str(featuresCounter[False][feat]), feat]) + '\n')
    for feat,_ in featuresCounter[False].most_common(6000):
        outFile.write(','.join([str(featuresCounter[True][feat]), str(featuresCounter[False][feat]), feat]) + '\n')