#!/usr/bin/env python
"""
Words stat
"""
pat_len = 2 # количество символов в комбинации для поиска
output = "report" + str(pat_len) + ".txt"
import os

MASS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N',\
        'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',"'"]
SCRIPT = os.path.realpath(__file__)
PATH = os.path.dirname(SCRIPT)
WORDS = open(os.path.join(PATH, "words.txt"), "rt")

def arrayGen(chars, num):
    num = num - 1
    if num == 0:
        return chars
    i = 0
    tmp_dict = chars
    while i < num:
        i = i + 1
        new_dict = []
        for c in tmp_dict:
            for char in chars:
                new_dict.append(c+char)
        tmp_dict = new_dict
    return tmp_dict

pattern_dict = arrayGen(MASS, pat_len)
ret = {}
for word in WORDS:
    for pattern in pattern_dict:
        if ret.get(pattern, 0) == 0:
            ret[pattern] = 0
        upword = word.upper()
        ret[pattern] += upword.count(pattern)
WORDS.close()

report = open(os.path.join(PATH, output), "w")
report.write(str(ret))
report.close()
