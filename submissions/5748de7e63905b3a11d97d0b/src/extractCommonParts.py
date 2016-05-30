from collections import Counter

__author__ = 'roma'

def extractCommonPrefixes():
    with open('prefixesF.txt','w') as prefixesFile, open('suffixesF.txt','w') as sufFile:
        prefixes = []
        suffixes = []
        for line in open('../run/false.csv'):
            line = line.replace('\n','')
            if len(line):
                prefixes.append(line[:1])
                prefixes.append(line[:2])

                if len(line) > 3:
                    prefixes.append(line[:3])
                    prefixes.append(line[:4])
                    prefixes.append(line[:5])

                suffixes.append(line[-1:])
                suffixes.append(line[-2:])

                if len(line) > 3:
                    suffixes.append(line[-3:])
                    suffixes.append(line[-4:])
                    suffixes.append(line[-5:])


                # prefixes.append(line.split(',')[0][:2])

        prefixesCounter = Counter(prefixes)
        # for p,c in prefixesCounter.items():
        #     print p + "," + str(c)
        commonPrefixes = [p for p,c in prefixesCounter.most_common(50)]
        prefixesFile.write('\n'.join(commonPrefixes))
        
        suffixesCounter = Counter(suffixes)
        for p,c in suffixesCounter.items():
            print p + "," + str(c)
        commonSuffixes = [p for p,c in suffixesCounter.most_common(50)]
        sufFile.write('\n'.join(commonSuffixes))

extractCommonPrefixes()