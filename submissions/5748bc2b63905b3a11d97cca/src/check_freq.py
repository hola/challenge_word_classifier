import utils
from sequencer import Sequencer
import matplotlib.pyplot as plt
from scipy import stats

def main():
    d = {}
    for word in open(utils.dict_file):
        d[word.strip()] = 0
    for word, ac in Sequencer(utils.train_file).Generator():
        if ac:
            d[word] += 1
    sd = set()
    for word in open('simple1000.txt'):
        sd.add(word.strip())
    arr = sorted(d.values())
    n = sum(arr)
    print 'n =', n
    chisq, p = stats.chisquare(map(lambda x: float(x) / n, arr))
    print chisq, p
    print 'avg =', float(n) / len(d)
    print 'savg = ', float(sum(d[x] for x in d.keys() if x in sd)) / 1000

if __name__ == '__main__':
    main()
