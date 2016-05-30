with open('words0.txt') as f:
    ws = f.readlines()

with open('words.txt', 'w') as f:
    f.writelines(sorted(set(map(str.lower, ws))))
