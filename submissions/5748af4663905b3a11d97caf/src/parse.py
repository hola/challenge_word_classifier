__author__ = "Volodymyr Melnyk"
__copyright__ = "Copyright 2016 (c) Volodymyr Melnyk"
__license__ = "Apache 2.0 http://www.apache.org/licenses/LICENSE-2.0"


from collections import *
import itertools, zlib, datetime, math



def word_ngrams(word, n):
    return [word[i: i + n] for i in range(len(word) - n + 1)]

def trie_encode(seq):
    last = ""
    ans = []
    for x in seq:
        p = 0
        while (p < len(last) and p < len(x) and last[p] == x[p]):
            p += 1
        #ans.append("{0} {2} {1}\n".format(x, x[p:] , str(len(last)-p)))
        #ans.append(x[p:] + str(len(last)-p))
        ans.append(x[p:])
        last = x
    return '*'.join(ans)
    
    
def write_data(data, filename):
    with open(filename, 'wb') as f:
        for x in data:
            f.write(x + '\n')
            
            
def write_gzip(data, filename):
    gzip_compress = zlib.compressobj(9, zlib.DEFLATED, zlib.MAX_WBITS|16,9,zlib.Z_FILTERED)
    gzip_data = gzip_compress.compress(data) + gzip_compress.flush()
    with open(filename, 'wb') as f:
        f.write(gzip_data)

        
def xhash(coef, mod, word):
    ans = 0
    for x in word:
        ans = (coef * ans + ord(x)) % mod
        #print x, ord(x), ans, mod
    return ans
    
    
def bloom(coef, nbytes, words):
    mod = 8 * nbytes
    print "Mod: ", mod
    buff=bytearray(nbytes)
    for w in words:
        h = xhash(coef, mod, w)
        buff[h/8] |= (1 << (h%8))
    #for i in range(5):
    #    print buff[i]
    return buff
    
def bloom_check(coef, buff, word):
    h = xhash(coef, 8 * len(buff), word)
    return (buff[h/8] & (1 << (h%8)) ) != 0

def load_test(filenames):
    if not isinstance(filenames, list):
        filenames = [filenames]
    data = []
    for filename in filenames:
        print filename
        with open(filename, 'r') as fin:
            for line in fin:
                line = line.strip()
                if line == "":
                    continue
                data.append((line[:-1], line[-1] == '1'))
    return data

def evaluator(dataset, f):
    tp = 0
    tn = 0
    fp = 0
    fn = 0
    for (w,s) in dataset:
        ans  = f(w)
        if ans:
            if s:
                tp += 1
            else:
                fp += 1
        else:
            if s:
                fn += 1
            else:
                tn += 1
    print "Pos %d Neg %d" % (tp + fn,fp + tn)
    acc = float(tp+tn)/(tp + tn + fp + fn)
    print "Acc %0.4f TPR %0.4f FPR %0.4f " % (
            acc,
            float(tp)/(tp + fn),
            float(tn)/(fp + tn)
    )
    return acc
    
def parse_words():
    all_word = []
    no_apos = []
    apos_s = []
    apos_in = []
    print datetime.datetime.now()
    with open("words.txt","r") as fin:
        for line in fin:
            line = line.strip().lower()
            pos = line.find("'")
            if (pos != -1):
                if (pos + 2 == len(line) and line[pos + 1] == "s"):
                    apos_s.append(line)
                else:
                    apos_in.append(line)
            else:
                no_apos.append(line)
            all_word.append(line)
    #
    all_word = sorted(set(all_word))
    no_apos = sorted(set(no_apos))
    apos_s = sorted(set(apos_s))
    apos_in = sorted(set(apos_in))
    
    black_list = set([x[:-2] for x in apos_s])
    j_dic = [x for x in no_apos if not x in black_list] + apos_s
    j_dic = sorted(set(j_dic))
    return all_word, no_apos, apos_s, apos_in, j_dic

def load_dataset():
    dataset=load_test(["generated/%d.txt" % i for i in range(1000, 20000, 1000)])
    clear_dataset=[w for w in dataset if ("'" not in w[0] and len(w[0])>1)]
    return dataset, clear_dataset

def main():
    all_word, no_apos, apos_s, apos_in, j_dic = parse_words()
    #dataset, clear_dataset = load_dataset()
    
    GRAM_SIZE = 3
    grams_set = set([g
                     for w in no_apos
                     for g in word_ngrams(w, GRAM_SIZE)])
    grams = sorted(grams_set)
    f_gram = [word_ngrams(w, GRAM_SIZE) for w in no_apos]
    f_gram = sorted(set([g[0] for g in f_gram if len(g)>0]))
    print len(grams), len(f_gram),len(grams)- len(f_gram)
    PREFIX_SIZE = 3
    prefix = sorted(set([w[:PREFIX_SIZE] for w in no_apos]))

    """pos = [w[0] for w in clear_dataset if w[1]]
    neg = [w[0] for w in clear_dataset if not w[1]]
    print len(pos), len(neg)
    p_pos = Counter([w[:PREFIX_SIZE] for w in pos])
    p_neg = Counter([w[:PREFIX_SIZE] for w in neg])
    p_all = p_pos + p_neg
    g_pos = Counter([g for w in pos for g in word_ngrams(w, GRAM_SIZE)])
    g_neg = Counter([g for w in neg for g in word_ngrams(w, GRAM_SIZE)])
    good_prefix = [p for p in prefix if p_pos[p] >= p_neg[p]]
    print len ([g for g in grams if g_pos[g] + g_neg[g]==0])
    f_gram = {g: float(g_pos[g])/(g_pos[g] + g_neg[g]) for g in grams}
    print len(good_prefix), len(prefix)"""

    write_data(grams, 'grams.txt')
    #write_data(no_apos, 'no_apos.txt')
    #write_data(apos_s, 'apos_s.txt')
    #write_data(apos_in, 'apos_in.txt')
    
    #write_gzip(''.join(trie_encode(grams)), './data.gz')
    #write_gzip(''.join(trie_encode(all_word)), './all.gz')
    
    out=buffer(bloom(37, 68100,no_apos+apos_s)) + trie_encode(grams)
    #out= ''.join(trie_encode(grams))
    #print out[68000:68000+10]
    write_gzip(out, './data.gz')
    def classifier(word):
        """if word[-2:] == "'s":
            word = word[:-2]
        for g in word_ngrams(word, GRAM_SIZE):
            if g not in grams_set:
                return False"""
        return (word[:PREFIX_SIZE] in good_prefix)
    
    #evaluator(load_test("generated/0.txt"), classifier)
    #end of main


if __name__ == "__main__":
    main()
