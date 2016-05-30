import urllib
import sys
import json

url = 'https://hola.org/challenges/word_classifier/testcase'

def Usage():
    print 'Usage', sys.argv[0], '-i/-o', 'seedfile', '[n]'

def GrabData(f, seed):
    obj = json.load(f)
    fout = open('data/' + str(seed) + '.csv', 'w')
    for k in obj:
        fout.write(k + ',' + str(int(obj[k])) + '\n')

def GetSeed():
    f = urllib.urlopen(url)
    seed = int(f.geturl().split('/')[-1])
    GrabData(f, seed)
    f.close()
    return seed

def Grab(seed):
    f = urllib.urlopen(url + '/' + str(seed))
    GrabData(f, seed)
    f.close()

def main():
    if len(sys.argv) < 3 or len(sys.argv) > 4:
        Usage()
        return

    if sys.argv[1] == '-i':
        cnt = 0
        for line in open(sys.argv[2]):
            cnt += 1
        cur = 0
        for line in open(sys.argv[2]):
            print cur, '/', cnt
            Grab(int(line))
            cur += 1
        print cnt, '/', cnt
    elif sys.argv[1] == '-o':
        try:
            cnt = int(sys.argv[3])
        except:
            Usage()
            return
        with open(sys.argv[2], 'w') as f:
            for i in xrange(cnt):
                print i, '/', cnt
                seed = GetSeed()
                f.write(str(seed) + '\n')
            print cnt, '/', cnt
    else:
        Usage()

if __name__ == '__main__':
    main()
