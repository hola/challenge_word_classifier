import json
import gzip
import functools

all_freq = json.loads(gzip.open("two_and_three.txt").read())
two_freq = {k: v for k,v in all_freq.items() if len(k) == 2}
three_freq = {k: v for k,v in all_freq.items() if len(k) == 3}

def ngram_looker(word, max_len=13, min_sum=0.01, long_sum=0.1):
    word = "^%s$" % word
    sum = 0.0
    try:
        for i in xrange(0, len(word) - 1):
            tf = float(two_freq[word[i:i+2]])
            sum += tf

        for i in xrange(0, len(word) - 2):
            tf = float(three_freq[word[i:i+3]])
            sum += tf

    except KeyError:
        return False

    if len(word) > max_len and sum < long_sum:
        return False


    return sum > min_sum

def meta_looker(word_len, sum_min, long_sum=0.1):
    return functools.partial(ngram_looker, max_len=word_len, min_sum=sum_min, long_sum=long_sum)
