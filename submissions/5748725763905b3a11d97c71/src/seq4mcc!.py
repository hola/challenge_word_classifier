from collections import Counter
from itertools import product

cs = Counter()
csp = Counter()
csn = Counter()
with open('words.txt') as f:
    for line in f:
        w = '={}='.format(line.strip())
        for c4 in zip(w, w[4:], w[6:], w[9:]):
            cs[c4] += 1
            if 'e' in w:
                csp[c4] += 1
            else:
                csn[c4] += 1


ALPHABET = "abcdefghijklmnopqrstuvwxyz'="           

with open('seq4cc1!.txt', 'w') as f:
    f.write('|'.join(
        ''.join(''.join(c2b)
            for c2b in product(ALPHABET, repeat=1)
            for c4 in [c2a + c2b]
            if cs.get(c4, 0) >= 2)
        for c2a in product(ALPHABET, repeat=3)))
    f.write(' ')    
    f.write('|'.join(
        ''.join(''.join(c2b)
            for c2b in product(ALPHABET, repeat=1)
            for c4 in [c2a + c2b]
            if cs.get(c4, 0) >= 8 and csp.get(c4, 0) < 2)
        for c2a in product(ALPHABET, repeat=3)))
    f.write(' ')
    f.write('|'.join(
        ''.join(''.join(c2b)
            for c2b in product(ALPHABET, repeat=1)
            for c4 in [c2a + c2b]
            if cs.get(c4, 0) >= 8 and csn.get(c4, 0) < 2)
        for c2a in product(ALPHABET, repeat=3)))
    f.write(' ')