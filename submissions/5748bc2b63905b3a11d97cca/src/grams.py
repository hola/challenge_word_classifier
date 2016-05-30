import utils
from collections import defaultdict
import argparse

class Grams:
    def __init__(self, args):
        self.args = args

    def Train(self, generator):
        # allocate memory
        self.probs = {}  # self.probs[len][pos][substr] = probability
        count = defaultdict(int)
        self.thresholds = defaultdict(float)
        for i in utils.train_range:
            self.probs[i] = []
            for j in xrange(i - self.args.n) if self.args.p else [0]:
                self.probs[i].append(defaultdict(float))

        for word in open(utils.dict_file):
            word = word.strip()
            if len(word) not in utils.train_range:
                continue

            # for counting
            if self.args.l:
                my_len = len(word)
            else:
                my_len = 0

            count[my_len] += 1

            # for grams
            for p in xrange(len(word) - self.args.n):
                substr = str[p : p + self.args.n]
                if self.args.p:
                    self.probs[my_len][p][substr] += 1
                else:
                    self.probs[my_len][0][substr] += 1

        # div to derive probability
        for my_len in utils.train_range if self.args.l else [0]:
            for x in self.probs[my_len]:
                for y in self.probs[my_len][x]:
                    self.probs[my_len][x][y] /= count[my_len]

        # learn thresholds
        rec = defaultdict(list)
        for word, ac in generator:
            if len(word) in utils.train_range:
                score = self.Score(word)
                rec[len(word)].append((score, ac))
        
        for n in rec.keys():
            rec[n].sort()
            totalAc = sum(1 for s, ac in rec[n] if ac)
            bestAcc = 0.0
            bestSplit = 0.0
            curAc = 0
            curWa = 0
            for i in xrange(1, len(rec[n])):
                if rec[n][i - 1][1]:
                    curAc += 1
                else:
                    curWa += 1
                curAcc = float(curWa + totalAc - curAc) / len(rec[n])
                if curAcc > bestAcc:
                    bestAcc = curAcc
                    bestSplit = (rec[n][i - 1][0] + rec[n][i][0]) / 2
            self.threshold[n] = bestSplit
            print 'Training', n, bestAcc * 100

    def Score(self, word):
        #TODO continue here
        appear = [False] * 27
        for ch in word:
            if ch >= 'a' and ch <= 'z':
                appear[ord(ch) - ord('a')] = True
            else:
                appear[26] = True
        score = 1.0
        for i in xrange(27):
            if appear[i]:
                score *= self.appear_prob[i]
            else:
                score *= 1.0 - self.appear_prob[i]
        return score

    def Predict(self, word):
        if len(word) not in utils.train_range:
            return False
        return self.Score(word) > self.threshold[len(word)]

if __name__ == '__main__':
    #parse arguments
    parser = argparse.ArgumentParser(formatter_class = argparse.ArgumentDefaultsHelpFormatter)
    parser.add_argument('-n', default = 1, help = 'n-gram', type = int)
    parser.add_argument('-p', '--pos', default = False, action = 'store_true', help = 'train per position')
    parser.add_argument('-l', '--len', default = False, action = 'store_true', help = 'train for each length separately')
    args = parser.parse_args()
    
    #train model
    maid = Grams(args)
    
    from sequencer import Sequencer
    maid.Train(Sequencer(utils.train_file).Generator())
    
    #validate model
    ac = [0] * 40
    cnt = [0] * 40

    for w, tar in Sequencer(utils.valid_file).Generator():
        if len(w) in utils.train_range:
            cnt[len(w)] += 1
            if maid.Predict(w) == tar:
                ac[len(w)] += 1

    #output validate result
    for i in utils.train_range:
        print 'Validation', i, float(ac[i] * 100) / cnt[i]
    print 'Validation', float(sum(ac) * 100) / sum(cnt)
