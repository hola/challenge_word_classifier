import gzip
import hashlib
import os
import pickle
import random
from string import printable
import numpy as np
from progressbar import ProgressBar
from wrds.words import connect_db

MD5 = hashlib.md5()




def munch2(salt_left=None, salt_right=None, HASH_SIZE=8 * 20000, groups=2, depression=0.6):
    length_to = 23
    length_from = 0
    try:
        pos_words = munch2.pos_words
        neg_words = munch2.neg_words
    except:
        c = connect_db()
        print('Loading data')
        c.execute(
                '''SELECT DISTINCT word, is_word FROM raw_words WHERE length<=? AND length>? AND is_word = 0;''',
                (length_to, length_from))
        neg_words = c.fetchall()
        c.execute(
                '''SELECT DISTINCT word, is_word FROM raw_words WHERE length<=? AND length>? AND is_word = 1;''',
                (length_to, length_from))
        pos_words = c.fetchall()
        munch2.pos_words = pos_words
        munch2.neg_words = neg_words
    bitmask = np.zeros(HASH_SIZE)
    if salt_left is None:
        salt_left = ['']
        salt_right = ['']
    optk = np.log2(HASH_SIZE / len(pos_words))
    print('Optimal k=%s' % optk)
    NUM_HASH = len(salt_left)
    bits = np.zeros((groups, int(NUM_HASH / groups)), dtype='int')
    PER_GROUP = bits.shape[1]
    bits_cost = np.zeros((groups))

    print('Filling bitmask')
    bitmask *= 0

    n = 0
    pos_hash = 0
    neg_hash = 0
    pgs = ProgressBar()
    bitmask = fill_bitmask(HASH_SIZE, PER_GROUP, bitmask, bits, bits_cost, depression, groups, pos_words,
                           salt_left, salt_right)
    total = len(neg_words)
    pos = 0
    total_l = [0] * 30
    pos_l = [0] * 30
    acc = validate(bitmask, salt_left, salt_right, neg_words, pos_words)
    return acc, bitmask


def fill_bitmask(HASH_SIZE, PER_GROUP, bitmask, bits, bits_cost, depression, groups, pos_words, salt_left,
                 salt_right):

    for epoch, row in enumerate(pos_words):
        wrd = row[0]
        bits *= 0
        bits_cost *= 0
        ptr = 0
        for group in range(groups):
            for bit_id in range(PER_GROUP):
                l = salt_left[ptr]
                r = salt_right[ptr]
                ptr += 1
                MD5 = hashlib.md5()
                MD5.update((l + wrd + r).encode(encoding='ascii'))
                a = int(MD5.hexdigest(), 16)
                a = int(a % HASH_SIZE)
                bits[group, bit_id] = a
                if bitmask[a] == 1:
                    bits_cost[group] -= 1
        min_group = np.argmin(bits_cost)

        bitmask[bits[min_group, :]] += 1
    # plt.hist(bitmask, 1024 )
    # plt.show()
    bitmask -= depression * len(pos_words)
    rare = np.where(bitmask <= 1)[0]
    np.random.shuffle(rare)
    rare = rare[:int(len(rare) * (depression))]
    print('Removing %s of ones' % len(rare))
    bitmask[rare] = 0
    bitmask[bitmask >= 1] = 1
    return bitmask


def check_word(MD5, word, salt_left, salt_right, HASH_SIZE, bitmask):
    MD5 = hashlib.md5()
    for l, r in zip(salt_left, salt_right):
        MD5.update((l + word + r).encode(encoding='ascii'))
        a = int(MD5.hexdigest(), 16)
        a = a % HASH_SIZE
        if bitmask[a] == 0:
            return False
    return True

def validate(bitmask, salt_left, salt_right, neg_words, pos_words):
    HASH_SIZE = bitmask.shape[0]
    c = connect_db()
    MD5 = hashlib.md5()
    total = 0
    correct_count = 0
    tw = [0] * 30
    tc = [0] * 30

    for word, correctness in pos_words:
        right_answer = True

        my_answer = check_word(MD5, word, salt_left, salt_right, HASH_SIZE, bitmask)
        tw[len(word)] += 1
        total +=1
        # print(my_answer,right_answer)
        if my_answer == right_answer:
            correct_count += 1
            tc[len(word)] += 1
    # print(correct_count, total)
    for word, correctness in neg_words:
        right_answer = False

        my_answer = check_word(MD5, word, salt_left, salt_right, HASH_SIZE, bitmask)
        tw[len(word)] += 1
        total +=1
        # print(my_answer,right_answer)
        if my_answer == right_answer:
            correct_count += 1
            tc[len(word)] += 1


    for i in range(30):
        if tw[i]>0:
            print("{:} letters, accuracy: {:.2%}".format(i, tc[i] / tw[i]))
    print('>> Overall accuracy: {:.2%}'.format(correct_count / total))

    return correct_count / total



def write_bytestream(be, bad_trines, fn='./kek.bs', _gzip =False):
    """
    Writes bytestream to datafile
    :param be:
    :param bad_trines:
    :param fn:
    :param _gzip:
    :return:
    """
    ba = bytearray()
    ba_trines = bytearray()
    mul = np.array([2 ** i for i in range(0, 8, 1)])
    bar = ProgressBar()
    for byte_id in bar(range(int(len(bad_trines) / 8))):
        if len(bad_trines[byte_id * 8:])>0:
            byte = (int)(mul.dot(bad_trines[byte_id * 8:(byte_id + 1) * 8]))
            ba_trines.append(byte)
        else:
            pass;

    bar = ProgressBar()
    for byte_id in bar(range(int(len(be) / 8))):
        byte = (int)(mul.dot(be[byte_id * 8:(byte_id + 1) * 8]))
        ba.append(byte)
    ap = ['s', 'ing', 'm', 'er', 'a', 're', 'd', 'n', 'ard', 'in', 'an', 'll', 'en', 't', 've']
    ap=','.join(ap)
    print('---------------------------------')
    print('Trines %s..%s'%(ba_trines[0:10],ba_trines[-10]))
    print('Hash %s..%s'%(ba[0],ba[-1]))
    print('to_config:\nc=%s;d=%s;'%(len(ap),len(ap)+len(ba_trines)))
    if _gzip:
        with gzip.open(fn, 'wb') as f:
            f.write(ap.encode('ascii'))
            f.write(ba_trines)
            f.write(ba)
    else:
        with (open(fn, 'wb')) as w:
            w.write(ap.encode('ascii'))
            w.write(ba_trines)
            w.write(ba)
    return len(ap),len(ap)+len(ba_trines)



LICENSE_INFO = """/* MD5 S.Tschan http://bit.ly/25pJz4a
big.js http://bit.ly/1U03BXQ */
"""
def prepare_release():
    """
    Assembles JS solution+Data and checks for size
    :return:
    """
    with open('./record', 'rb') as w:
        prefix, postfix, bm = pickle.load(w)

    ba = np.load('./bad_trines.npy')


    FN='./js/data.gz'
    c,d=write_bytestream(bm,ba,FN, _gzip = True)
    data_size = os.stat(FN)
    with open('./js/_solution.js','r') as tplt:
        code = tplt.read()

    code = code.replace('###LEFT###', prefix[0])
    code = code.replace('###RIGHT###', postfix[0])
    code = code.replace('###BOUNDARIES###', 'c=%s,d=%s'%(c,d))
    code = code.replace('###HASHSIZE###', str(len(bm)))

    with open('./js/solution.full.js','w') as tplt:
        tplt.write(code)

    with open('./js/solution.js','w') as tplt:
        tplt.write(LICENSE_INFO)

    os.system('uglifyjs ./js/solution.full.js --compress --mangle >> ./js/solution.js')

    code_size = os.stat('./js/solution.js')
    ovs = code_size.st_size + data_size.st_size
    print("\n\nTotal size: %sb"%(ovs))
    if ovs>65536:
        raise Exception('TOO FAT, TRY AGAIN')


if __name__ == '__main__':
    prepare_release()
    exit()

    # stochastic search
    prefix = []
    postfix = []
    NUM_HASH = 1
    N_ATTEMPTS = 10
    N_GROUPS = 1
    DEPRESSION = 0.00
    BITMASK_SIZE = 8 * 57000

    vars = printable[:-7]
    gimme_word = lambda max: "".join(random.sample(vars, random.randint(0, max)))
    best = None
    for NUM_HASH in [1]:
        for i in range(20):
            prefix.clear()
            postfix.clear()
            for i in range(NUM_HASH * N_GROUPS):
                prefix.append(gimme_word(10))
                postfix.append(gimme_word(10))

            q, bm = munch2(prefix, postfix, HASH_SIZE=int(BITMASK_SIZE), groups=N_GROUPS, depression=DEPRESSION)
            print('\n >> Acc: {:.2%}'.format(q))
            if best is None or q > best:
                print('BEST')
                best = q
                with open('./record', 'wb') as w:
                    pickle.dump((prefix, postfix, bm), w)


    exit()
