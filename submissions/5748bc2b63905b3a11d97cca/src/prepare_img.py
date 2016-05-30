import numpy as np

def get_pos(n):
    return 0  # (24 - n) // 2

def transform(words):
    n = len(words)
    out = np.zeros([n, 1, 24, 27], np.float32)
    for i in xrange(len(words)):
        pos = get_pos(len(words[i]))
        for j in xrange(len(words[i])):
            ch = words[i][j]
            if ch >= 'a' and ch <= 'z':
                y = ord(ch) - ord('a')
            else:
                y = 26
            out[i][0][pos + j][y] = 1.0
    return out

if __name__ == '__main__':
    words = ['xyzzyx','abcd',"dfag'dsf"]
    arr = transform(words)
    for i in xrange(3):
        for j in xrange(24):
            s = ''
            for k in xrange(27):
                s += ' ' + str(arr[i][0][j][k])
            print s
        print ''
