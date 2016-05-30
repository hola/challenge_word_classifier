import utils
from collections import defaultdict

class AppearSep:
    def __init__(self):
        self.score_ready = False
        self.predict_ready = False

    def Train(self, generator):
        self.appear_prob = []
        for i in xrange(max(utils.train_range) + 1):
            self.appear_prob.append([0.0] * 27)
        cnt = [0] * 40
        for word in open(utils.dict_file):
            if len(word) not in utils.train_range:
                continue
            n = len(word)
            cnt[n] += 1
            for ch in word.strip():
                if ch >= 'a' and ch <= 'z':
                    self.appear_prob[n][ord(ch) - ord('a')] += 1
                else:
                    self.appear_prob[n][26] += 1
        for i in xrange(27):
            for n in utils.train_range:
                self.appear_prob[n][i] /= cnt[n]

        self.score_ready = True

        self.threshold = {}
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
            print 'Training', n, bestAcc * 100, len(rec[n])
        self.predict_ready = True

    def Score(self, word):
        if not self.score_ready:
            raise Exception('score calculation not ready')
        appear = [False] * 27
        for ch in word:
            if ch >= 'a' and ch <= 'z':
                appear[ord(ch) - ord('a')] = True
            else:
                appear[26] = True
        score = 1.0
        n = len(word)
        for i in xrange(27):
            if appear[i]:
                score *= self.appear_prob[n][i]
            else:
                score *= 1.0 - self.appear_prob[n][i]
        return score

    def Predict(self, word):
        if not self.predict_ready:
            raise Exception('prediction is not ready')
        if len(word) not in utils.train_range:
            return False
        return self.Score(word) > self.threshold[len(word)]

if __name__ == '__main__':
    from sequencer import Sequencer
    maid = AppearSep()
    maid.Train(Sequencer(utils.train_file).Generator())
    ac = [0] * 40
    cnt = [0] * 40
    for w, tar in Sequencer(utils.valid_file).Generator():
        if len(w) in utils.train_range:
            cnt[len(w)] += 1
            if maid.Predict(w) == tar:
                ac[len(w)] += 1
    for i in utils.train_range:
        print 'Validation', i, float(ac[i] * 100) / cnt[i]
    print 'Validation', float(sum(ac) * 100) / sum(cnt)
