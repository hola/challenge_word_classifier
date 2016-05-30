#!/usr/bin/env python
"""
Words stat
"""
pat_len = 2
report = "report" + str(pat_len)+".txt"
import os
out = "stat"+str(pat_len)+".txt"

SCRIPT = os.path.realpath(__file__)
PATH = os.path.dirname(SCRIPT)
WORDS = open(os.path.join(PATH, "words.txt"), "rt")
PATTERNS = eval(open(os.path.join(PATH, report), "rt").read())

ret = {}
default = [0, 0, 0, 0, 0]
for word in WORDS:
    x = 0
    l = len(word)
    if l>=pat_len and l<=8:
        [min_c, max_c, sum_c, tot_c, avg_c] = ret.get(l, default)
    else:
        [min_c, max_c, sum_c, tot_c, avg_c] = ret.get('>8', default)
    upword = word.upper()
    xi = 0
    for pattern in PATTERNS:
        p = PATTERNS[pattern]
        if p:
            c = upword.count(pattern)
            if c != 0:
                xi += c
                x += p * c
    if xi:
        if x/xi < min_c or min_c == 0:
            min_c = x/xi    #MIN 
        if x/xi > max_c:
            max_c = x/xi    #MAX
        sum_c += (x/xi)     #SUM
        tot_c += 1          #TOT
        avg_c = sum_c/tot_c #AVG
        if l>=pat_len and l<=8:
            ret[l] = [min_c, max_c, sum_c, tot_c, avg_c]
        else:
            ret['>8'] = [min_c, max_c, sum_c, tot_c, avg_c]

WORDS.close()

stat = open(os.path.join(PATH, out), "w")
stat.write(str(ret))
stat.close()
