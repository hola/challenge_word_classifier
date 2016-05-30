import sys
from collections import defaultdict

def main():
    if len(sys.argv) != 2:
        print 'Usage:', sys.argv[0], 'dict'
        return

    cnt = defaultdict(int)

    mydict = set()
    for word in open(sys.argv[1], 'r'):
        mydict.add(word.strip().lower())

    for word in mydict:
        cnt[len(word.strip())] += 1

    s = sum(cnt.values())

    for i in xrange(max(cnt)):
        print i + 1, float(cnt[i + 1]) * 100 / s, cnt[i + 1]
    print 'total', '100', s

    c2 = 0
    for i in xrange(1, 3):
        c2 += cnt[i] * i
    for i in xrange(21, max(cnt) + 1):
        c2 += cnt[i] * i
    print c2 / 1024.0

if __name__ == '__main__':
    main()
