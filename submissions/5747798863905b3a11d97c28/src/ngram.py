import gzip
import json
from StringIO import StringIO
from collections import defaultdict


EXPECTED_FILE_SIZE = 64000
words = open("words.txt").read().lower().split("\n")


def ngram(word, how_much):
    ngrams = []
    for i in xrange(len(word) - how_much + 1):
        ngrams.append(word[i:i + how_much])

    return ngrams


def ngram_list_of_words(words, how_much):
    en_gram_to_appearance_count = defaultdict(lambda: 0)

    for word in words:
        with_start_and_end = "^%s$" % word
        en_grams = ngram(with_start_and_end, how_much)

        for i in en_grams:
            en_gram_to_appearance_count[i] += 1

    return en_gram_to_appearance_count

def save_formatted_list(appearance_count, fobj):
    #First calculate percentages:
    item_count = float(sum(appearance_count.values()))

    for item in appearance_count:
        appearance_count[item] = "%.15f" % (float(appearance_count[item]) / item_count)

    current_size = EXPECTED_FILE_SIZE + 1
    while current_size > EXPECTED_FILE_SIZE:
        minimums = []
        for i in xrange(10):
            minimums.append(min(appearance_count.values()))
        appearance_count = {k:v for k,v in appearance_count.items() if v not in minimums}

        out = StringIO()
        with gzip.GzipFile(fileobj=out, mode='w') as f:
            f.write(json.dumps(appearance_count))

        compressed = out.getvalue()
        current_size = len(compressed)
        print current_size

    json.dump(appearance_count, fobj, separators=(',',':'))


def save_file(fname, appearance_count, should_gzip=False):
    if should_gzip:
        fobj = gzip.open(fname, 'w')
    else:
        fobj = open(fname, 'w')

    save_formatted_list(appearance_count, fobj)
    return fobj

all_gram = ngram_list_of_words(words, 2)
all_gram.update(ngram_list_of_words(words, 3))

strio = save_file("two_and_three.txt", all_gram, True)



# import ipdb;ipdb.set_trace()
#
