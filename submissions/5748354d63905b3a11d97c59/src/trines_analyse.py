import numpy as np

bfa = np.load('./trines.npy')


def word_to_score(word, q):
    a = ord('a')
    score = 1
    l_id = [ord(l) - a for l in word]
    for i in range(len(word) - 2):
        sub = word[i:i + 3]
        score *= q[l_id[i], l_id[i + 1], l_id[i + 2]]
    return score


def bfa_to_letter(indices):
    a = ord('a')
    print("".join([chr(a + i) for i in indices[:3]]))
    return "".join([chr(a + i) for i in indices[:3]])


def q_to_l(q):
    s = list()
    for trine in zip(*((np.nonzero(q))[:3])):
        if trine is None:
            continue
        # print(trine)
        s.append(bfa_to_letter(trine))
    return s


def trine_to_id(trine):
    return trine[0] * 26 ** 2 + trine[1] * 26 + trine[2]


def q_to_ba(q):
    ba = np.zeros(26 * 26 * 26)
    for trine in zip(*((np.nonzero(q))[:3])):
        ba[trine_to_id(trine)] = 1
    return ba

# k = q_to_l(bfa[:, :, :] == 0)
# print(len(k))
ba = q_to_ba(bfa[:, :, :] == 0)
# print(trine_to_id('aax'))
def w_to_i(word):
   a = ord('a')
   return [ord(l) - a for l in word]

print(w_to_i('aax'))
print(ba[trine_to_id(w_to_i('abc'))])

np.save('./bad_trines.npy', ba)