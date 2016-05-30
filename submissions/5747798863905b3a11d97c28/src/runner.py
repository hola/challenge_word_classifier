import os
import time
import json

import requests

import ngram_looker
import random_looker



TEST_CASE_URL = "https://hola.org/challenges/word_classifier/testcase/%s" # % (number_of_test_case, )
OUTPUT_DIR = "run_results"


def get_test_json_dict(test_file_dir=None):
    d = {}
    for i in xrange(1, 10):
        d.update(json.load(open(r"C:\work\hola\outputs\%s.json" % i)))

    return d


test_cases = get_test_json_dict()

def test_all_cases(test_func, should_log=False):
    true_positives = []
    false_negatives = []
    false_positives = []
    true_negatives = []


    for case, is_word in test_cases.items():
        runner_result = tester(case)

        if runner_result == is_word:
            if runner_result:
                true_positives.append(case)
            else:
                true_negatives.append(case)

        else:
            if runner_result:
                false_positives.append(case)
            else:
                false_negatives.append(case)

    right_percent = (len(true_negatives) + len(true_positives)) / float(len(test_cases))

    if should_log:
        print "Right %%:", right_percent
        result_file = open(os.path.join(OUTPUT_DIR, "%s_ngram.result" % time.time()), 'w')
        result_file.write("Right guesses: %s\n" % right_percent)
        result_file.write("True positives\n%s\n" % json.dumps(true_positives))
        result_file.write("True negatives\n%s\n" % json.dumps(true_negatives))
        result_file.write("\n\n")
        result_file.write("False positives\n%s\n" % json.dumps(false_positives))
        result_file.write("False negatives\n%s\n" % json.dumps(false_negatives))

    return right_percent


max_combo = None
max_percent = 0
word_len = 13
for long_sum in [1, 0.9, 1.1]:
    for sum_len in [0.006]:
        tester = ngram_looker.meta_looker(13, sum_len, long_sum)
        right_percent = test_all_cases(tester)
        print "%s, %s, %s = %s" % (word_len, sum_len, long_sum, right_percent)

        if right_percent > max_percent:
            max_combo = (word_len, sum_len, long_sum)
            max_percent = right_percent


print max_combo, max_percent

####13, 0.006 = best combo of word len and sum_len