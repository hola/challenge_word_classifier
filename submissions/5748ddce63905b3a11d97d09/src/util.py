import numpy as np


def caseVector(word: str):
    if word.islower():
        case = 0
    elif word.isupper():
        case = 2
    else:
        case = 1
    return case


def charCode(ch: str):
    return chr(ch)


def word2vec(word):
    # chars = map(charCode, list(word.lower()))
    case = caseVector(word)
    wordVec = [27 if ch == "'" else ord(ch.lower()) - 96 for ch in word]
    chars = [[case, x] for x in wordVec]
    return chars
    # OneHotEncoder(
    #    n_values=[3, 28])


def word2vec2(word, maxWordLen):
    # chars = map(charCode, list(word.lower()))
    word = word.lower()
    res = np.zeros(len(word) + 1)
    for i, ch in enumerate(word):
        res[i] = 27 if ch == "'" else ord(ch) - 96
    res[len(word)] = 0
    return res

# oneHotWordEncoder = OneHotEncoder(n_values=[3, 28])
# , sparse=True


def word2onehot(word):
    return oneHotWordEncoder.fit_transform(word2vec(word))

# catEncoder = OneHotEncoder(n_values=[2])


def category2onehot(cat):
    if cat == 1:
        return np.array([0, 1])
        # return sparse.csr_matrix([1, 0])
    else:
        return np.array([1, 0])
        # return sparse.csr_matrix([0, 1])
#    return catEncoder.fit_transform([cat])

# good1hot = pd.read_csv('./data/good3chars.txt', names=["word"], dtype=str,
#                        na_filter=False,
#                        verbose=False)

# bad1hot = pd.read_csv('./data/bad3chars465.txt', names=["word"], dtype=str,
#                       na_filter=False,
#                       verbose=False)

# TBD Write generator of bad words!


def fastword2vec(w):
    w = word2vec(w)
    # case = np.array([w[0][0]])
    # chars = np.array([x[1] for x in w])
    # caseVec = np.zeros((1, 3))
    # caseVec[0, case] = 1
    # wordVec = np.zeros()
    # print(repr(chars))
    # vec = np.concatenate((case, chars.reshape((1, 84))))
    vec = np.zeros((len(w), 31))
    vec[np.arange(len(w)), [x[0] for x in w]] = 1
    vec[np.arange(len(w)), [x[1] + 3 for x in w]] = 1
    return vec[0]


def fastword2vec2(w, maxWordLen, data_dim):
    vec = word2vec2(w, maxWordLen)
    res = np.zeros((maxWordLen+1, data_dim))
    # for i in range(maxWordLen+1):
    #     res[i, [x for x in vec]] = 1
    res[np.arange(len(vec)), [x for x in vec]] = 1
    return res
