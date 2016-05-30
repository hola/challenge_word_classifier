import sqlite3
import numpy as np


def connect_db():
    s = sqlite3.connect('words.db')
    return s.cursor()


def create_db():
    c = connect_db()
    try:
        c.execute('''CREATE TABLE raw_words (word TEXT, length INT, cap_count INT, is_word INT)''')
    except:
        c.execute('''DELETE FROM  raw_words WHERE length>0;''')


def write_db():
    c = connect_db()
    tma = []
    endings = []
    with open('./words.txt', 'r') as r:
        harvest(c, r, is_word=1)
    with open('./falseWords.txt', 'r') as r:
        harvest(c, r, is_word=0)
    c.connection.commit()
    c.close()
    print(tma)


def harvest(c, r, is_word):
    for l in r:
        sl = l.strip()
        if "'" in sl:
            sx = sl.split("'")
            if len(sx) == 2 and sx[1] != 's':
                continue
            if len(sx) > 2:
                continue
            sl = sx[0]
        if (len(sl) == 1):
            print('%s: %s' % (l.strip(), is_word))
        cap = sum(1 if i.isupper() else 0 for i in sl)
        length = len(sl)
        c.execute('''INSERT INTO raw_words VALUES (?, ?, ?, ?);''', (sl.lower(), length, cap, is_word))
        # print('.', end='')


def ohe(word):
    a = ord('a')
    ohed = np.zeros((26, len(word)))
    for pos, l in enumerate(word):
        ohed[ord(l) - a, pos] = 1
    return ohed


def prepare_data(length=5):
    c = connect_db()
    X_data = []
    y_data = []
    for row in c.execute('''SELECT DISTINCT word, is_word FROM raw_words WHERE cap_count<=1 AND length=?;''',
                         (length,)):
        y_data.append(row[1])
        X_data.append(ohe(row[0]))

    X_data = np.array(X_data)
    y_data = np.array(y_data)
    print(X_data.shape)
    print(y_data.shape)
    return X_data, y_data

if __name__ == '__main__':
    # create_db()
    # write_db()
    pass
