# -*- coding: utf-8 -*-
#-------------------------------------------------------------------------------
# Name:        get_public_testdata.py
# Purpose:     Get multiple sample inputs from hola Code challenges for "JS word classifier"
#
# Author:      rabbit125
#
# Created:     2016/05/20
# Copyright:   (c) rabbit125 2016
#
# Usage:       get_public_testdata.py -d DIR_TO_SAVE_PUBLIC_TESTDATA -s NUMBER_OF_CASES
#-------------------------------------------------------------------------------

import argparse
import sys
import random
import wget
import os


global public_test_case_URL, input_dir, test_dir
public_test_case_URL = "https://hola.org/challenges/word_classifier/testcase"
input_dir = "./hola_inputcases"
test_dir = "./hola_testcases"

def initGVars():
    if not os.path.isdir(input_dir):
        os.mkdir(input_dir)

class Args(object):
    args = None
    def __init__(self):
        self.args = self.ParaSet()
        print(self.args)

    def ParaSet(self):
        argparser = argparse.ArgumentParser(description='get_public_testdata.py -d DIR_TO_SAVE_PUBLIC_TESTDATA -s NUMBER_OF_CASES')
        argparser.add_argument('-d',  '--datapath',   type=str, default='./hola_inputcases', help='path to save wget files, default: ./hola_inputcases')
        argparser.add_argument('-s',  '--getsize',    type=int, default=0,                   help='number of file will get by wget')
        cur_args = argparser.parse_args()
        cur_args = vars(cur_args)
        return cur_args

def main():
    global input_dir
    paras = Args()
    input_dir = paras.args["datapath"]
    nb_files  = paras.args["getsize"]
    initGVars()
    random_ints = []
    if(nb_files):
        for i in range(nb_files):
            ran_int = random.randint(1, 10000000)
            if ran_int not in random_ints:
                random_ints.append(ran_int)
        print("Number of cases for downloading: %s" % sys.argv[1])
        #print random_ints

    for idx, ran_int in enumerate(random_ints):
        url = "%s/%s" % (public_test_case_URL, str(ran_int))
        saved_name = os.path.join(input_dir, "test%s.txt" % str(ran_int))
        wget.download(url, saved_name)
        print("\n%5d: %s" % (idx + 1, saved_name))

if __name__ == '__main__':
    main()
