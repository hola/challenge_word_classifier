#!/usr/bin/env python

from __future__ import print_function
from __future__ import division

import os,math
from collections import OrderedDict

# 2char
# y=2.25*x^2
# x=(y/2.25)^1/2

# 3char
# y=0.56*x^2
# x=(y/0.56)^1/2


MASS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N',\
        'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',"'"]



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

a2 = arrayGen(MASS, 2);
a3 = arrayGen(MASS, 3);

SCRIPT = os.path.realpath(__file__)
PATH = os.path.dirname(SCRIPT)
FILE2 = open(os.path.join(PATH, "report2.txt"), "rt").read()
FILE3 = open(os.path.join(PATH, "report3.txt"), "rt").read()
PATTERNS2 = eval(FILE2)
PATTERNS3 = eval(FILE3)
OP2 = OrderedDict(sorted(PATTERNS2.items(), key=lambda i:a2.index(i[0])))
OP3 = OrderedDict(sorted(PATTERNS3.items(), key=lambda i:a3.index(i[0])))
OUT = open(os.path.join(PATH,'data'), 'wb')
BYTES = []
OP = OP2
for pattern in OP: 
    if OP[pattern]>0:
        y = OP[pattern]
        x = math.floor((math.sqrt(y/2.25)))
        if x < 1:
            x =1
    else:
        x = 0
    BYTES.append(x)

OP = OP3
for pattern in OP: 
    if OP[pattern]>0:
        y = OP[pattern]
        x = math.floor((math.sqrt(y/0.56)))
        if x < 1:
            x =1
    else:
        x = 0
    BYTES.append(x)


OUT.write(bytes(BYTES))
OUT.close()
