import pandas as pd
import csv
import random
import sys

if (len(sys.argv) != 3):
    print("Run as: gendata.py words.txt bad.txt > test.csv")
    sys.exit(0)

df = pd.read_csv(
    sys.argv[2],
    # './data/big3.csv',
    header=None,
    names=["word"],
    dtype={
        "word": str},
    # names=["word", "valid"],
    # dtype={
    # "word": str,
    # "valid": int},
    na_filter=False,
    # index_col="word",
    verbose=False)
# invalid = df[df.valid == 0]
# invalid = invalid.iloc[:, 0].values
invalid = df.iloc[:, 0].values

dfWords = pd.read_csv(
    sys.argv[1],
    # './data/words_lo_uniq.txt',
    header=None,
    names=["word"],
    dtype={
        "word": str},
    na_filter=False,
    # index_col="word",
    verbose=False)

words = dfWords.iloc[:, 0].values
random.shuffle(words)


# construct new df
x = []
wordsLen = len(words)
badLen = len(invalid)
if wordsLen < badLen:
    outLen = wordsLen
else:
    outLen = badLen

for i in range(outLen):
    x.append([words[i % wordsLen], 1])
    x.append([invalid[i % badLen], 0])

train = pd.DataFrame.from_records(x)
train.to_csv(
    sys.stdout,
    # './data/gen_train.csv',
    header=False, quoting=csv.QUOTE_NONE, index=False)
