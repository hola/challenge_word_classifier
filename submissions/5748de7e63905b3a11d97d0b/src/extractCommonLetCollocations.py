from collections import Counter

__author__ = 'roma'

def extractCommonLettersCollocations():
    with open('twoLetCol.txt','w') as twoLetCollocations, open('threeLetCol.txt','w') as threeLetCollocations,\
            open('fourLetCol.txt','w') as fourLetCollocations, open('fiveLetCol.txt','w') as fiveLetCollocations:
        twoLetCol = []
        threeLetCol = []
        fourLetCol = []
        fiveLetCol = []
        for line in open('../run/words.txt'):
            line = line.replace('\n','')
            if len(line) > 1:
                twoLetCol.extend([line[i:i+2] for i in range(0,len(line) - 1)])
            if len(line) > 2:
                threeLetCol.extend([line[i:i+3] for i in range(0,len(line) - 2)])
            if len(line) > 3:
                fourLetCol.extend([line[i:i+4] for i in range(0,len(line) - 3)])
            if len(line) > 4:
                fiveLetCol.extend([line[i:i+5] for i in range(0,len(line) - 4)])
                
        twoLetColCounter = Counter(twoLetCol)
        for p,c in twoLetColCounter.items():
            twoLetCollocations.write(','.join([p, str(c)]) + '\n')
        threeLetColCounter = Counter(threeLetCol)
        for p,c in threeLetColCounter.items():
            threeLetCollocations.write(','.join([p, str(c)]) + '\n')
        fourLetColCounter = Counter(fourLetCol)
        for p,c in fourLetColCounter.items():
            fourLetCollocations.write(','.join([p, str(c)]) + '\n')
        fiveLetColCounter = Counter(fiveLetCol)
        for p,c in fiveLetColCounter.items():
            fiveLetCollocations.write(','.join([p, str(c)]) + '\n')

extractCommonLettersCollocations()