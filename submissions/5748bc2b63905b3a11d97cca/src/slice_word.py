d2 = set()
do = set()

if __name__ == '__main__':
    for word in open('new_words.txt'):
        word = word.strip()
        if len(word) == 2:
            d2.add(word)
        if len(word) > 24:
            do.add(word)
        
    for i in xrange(ord('a'), ord('z') + 1):
        for j in xrange(ord('a'), ord('z') + 1):
            s = chr(i) + chr(j)
            if s not in d2:
                print s

    for s in do:
        print s
