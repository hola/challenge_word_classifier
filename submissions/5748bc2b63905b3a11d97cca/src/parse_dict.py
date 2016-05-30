s = set()

for word in open('words.txt'):
    word = word.strip().lower()
    s.add(word)

for word in s:
    print word
