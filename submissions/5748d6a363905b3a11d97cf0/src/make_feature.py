# -*- coding: utf-8 -*-
#-------------------------------------------------------------------------------
# Name:        make_feature.py
# Purpose:     Parse JSON input, and transfer them into feature vector and collect the "true" & "false" cases
#
# Author:      rabbit125
#
# Created:     2016/05/20
# Copyright:   (c) rabbit125 2016
#
# Usage:       make_feature.py -f OUTPUT_PKL_FILE -l NUMBER_OF_WORDS_BE_SAVED
#-------------------------------------------------------------------------------

from __future__ import division

import get_public_testdata

import argparse
import json
import math
import operator
import os
import random
import string
import sys

import wget
import execjs
import execjs.runtime_names

import numpy as np



# python33
if sys.version_info < (3,3):
    import cPickle as pck
else:
    import _pickle as pck


global false_dict, true_dict, chars_map
global ignore_UPPER_ratio, show_meg, max_hash_limit
max_hash_limit     = 20000000
show_meg           = 100000
ignore_UPPER_ratio = 1.0
false_dict         = {}
true_dict          = {}
total_case         = 0

global start_als_cond, length_cond, false_wrongs_and_notin, true_not_in
start_als_cond = ["s", "c", "p", "a", "m", "b", "t", "d", "r", "u"]
length_cond    = [  9,   8,  10,   7,  11,   6,  12,  13,   5,  14]



global off_set_base, hashf_cnt, hashf_group
hashf_group = 3
hashf_cnt = 6
off_set_base = 3

global js_max_safe_int
js_max_safe_int = 9007199254740991
                      # 2147483647 = 0x7FFFFFFF
import gzip

global js_feature_parsing_fc

def AddFalseInput(cur_files):
    global total_case
    for cur_file in cur_files:
        with open(cur_file) as json_data:
            my_dict = json.load(json_data)
            #print(my_dict)
        total_case += len(my_dict)
        for key, is_in in my_dict.items():
            if is_in == False:
                false_dict[key] = -1

        false_case_num = len(false_dict)
        #print(false_case_num, total_case)
    print("Ratio of False Case in %d input files: %9.7f" % (len(cur_files), false_case_num / float(total_case)))

def AddTrueInput():
    with open("words.txt", "r") as true_data:
        for dict_word in true_data.read().splitlines():
            true_dict[dict_word] = 1


def parseFeature(words, str_len):
    feature_ret = []
    single_vowel_map = ["a", "e", "i", "o", "u"];
    single_vowel_cnt = [0, 0, 0, 0, 0];
    double_vowel_map = ["aa", "ae", "ai", "ao", "au",
                        "ea", "ee", "ei", "eo", "eu",
                        "ia", "ie", "ii", "io", "iu",
                        "oa", "oe", "oi", "oo", "ou",
                        "ua", "ue", "ui", "uo", "uu"];
    double_vowel_cnt = [0, 0, 0, 0, 0,
                        0, 0, 0, 0, 0,
                        0, 0, 0, 0, 0,
                        0, 0, 0, 0, 0,
                        0, 0, 0, 0, 0];

    gram_2_terms = ["ar", "er", "or", "th", "ed", "gy", "fy", "ce", "cy", "ey", "ly", "te", "ty", "ry", "cr", "gr", "sp", "un", "sh",
                    "gh", "pl", "ph", "'s", "al", "ic",
                    "an", "ab", "ac", "ad", "bi", "co", "de", "di", "di", "du", "em", "en", "in", "ep", "eu", "ex", "il", "in", "ig",
                    "im", "in", "ir", "my", "ob", "op", "od", "op", "re", "se", "sy", "un", "zo"]
    gram_3_terms = ["dri", "bra", "par", "car", "ble", "ple", "que", "ast", "men", "jur", "jus", "qui", "vis", "ist", "ies", "phy", "tis",
                    "cul", "tic", "ium", "gam", "gon", "ade", "age", "ant", "ard", "ary", "ate", "dom", "dox", "eer", "ent", "ern", "ese",
                    "ess", "est", "ful", "ial", "ian", "ile", "ily", "ine", "ing", "ion", "ish", "ism", "ity", "ive", "ize", "let", "oid",
                    "oma", "ory", "ous", "ure",
                    "abs", "act", "aer", "agr", "alg", "ami", "ana", "ann", "apo", "aqu", "art", "aud", "avi", "bar", "bin", "bio", "col",
                    "com", "con", "dec", "dem", "dis", "dia", "don", "duc", "duo", "dur", "dyn", "dys", "ego", "enn", "epi", "equ", "erg",
                    "fac", "fer", "fid", "for", "fug", "fus", "gen", "geo", "ger", "gon", "gyn", "hem", "hex", "hyp", "iso", "jud", "lab",
                    "lex", "lip", "ite", "loc", "log", "luc", "lud", "lus", "lun", "mal", "man", "mar", "max", "mid", "min", "mis", "mit",
                    "mob", "mon", "mot", "mov", "mut", "myo", "nat", "nav", "neg", "neo", "nom", "non", "not", "nov", "oct", "ocu", "opt",
                    "ops", "opt", "out", "oxi", "pan", "ped", "pel", "per", "pod", "pon", "pop", "pos", "pre", "pro", "pul", "put", "pyr",
                    "ram", "reg", "rid", "rrh", "rub", "san", "sci", "sed", "sid", "sex", "sol", "sol", "son", "sta", "sub", "sum", "sym",
                    "syn", "syl", "sys", "tax", "tel", "ten", "tin", "ter", "the", "the", "tox", "tri", "uni", "urb", "vac", "ven", "ver",
                    "vid", "vic", "vis", "viv", "vit", "voc", "vol", "vor", "xen", "xer", "xyl", "zoo", "zyg"]
    gram_4_terms = ["tive", "ture", "teen", "logu", "quit", "sens", "sent", "able", "ance", "crat", "cule", "emia", "ence", "ency", "etic",
                    "ette", "hood", "ible", "ious", "itis", "less", "like", "ling", "ment", "ness", "onym", "opia", "opsy", "osis", "pnea",
                    "ship", "sion", "some", "tion", "tude", "ular", "uous", "ward", "ware", "wise", "gamy", "tome", "tomy", "ical",
                    "acro", "aero", "agri", "agro", "algo", "ambi", "amio", "andr", "anim", "ante", "anth", "anti", "apho", "aqua", "arch",
                    "arch", "audi", "auto", "avia", "baro", "bell", "bene", "burs", "calc", "cand", "capt", "cept", "carn", "cata", "caut",
                    "cede", "ceed", "cess", "cent", "cert", "cide", "cise", "clam", "clar", "clud", "clus", "cogn", "corp", "cosm", "cred",
                    "cruc", "curr", "curs", "cycl", "deca", "deka", "deci", "demo", "demi", "dent", "dont", "derm", "dict", "duct", "dyna",
                    "endo", "enni", "anni", "equi", "ergo", "esth", "fact", "flor", "fore", "form", "frag", "geno", "gene", "giga", "gram",
                    "gran", "grat", "gyno", "gyne", "grad", "hect", "heli", "hemi", "hemo", "hema", "hepa", "hept", "hexa", "homo", "hydr",
                    "hygr", "hypo", "iatr", "icon", "idio", "imag", "ject", "kilo", "kine", "lact", "leuk", "leuc", "lipo", "lite", "lith",
                    "logo", "loqu", "locu", "luna", "luni", "magn", "male", "mani", "manu", "mand", "mari", "matr", "medi", "mega", "mers",
                    "meso", "meta", "metr", "migr", "mini", "miso", "miss", "mono", "mort", "narr", "necr", "neur", "noun", "nunc", "octa",
                    "octo", "odor", "omni", "over", "pale", "para", "para", "patr", "path", "pedi", "pede", "pent", "pept", "peps", "peri",
                    "phag", "phil", "phon", "phot", "phys", "phyt", "plas", "plod", "plos", "pode", "poli", "poly", "port", "post", "prot",
                    "pugn", "pung", "purg", "pyro", "quad", "quin", "rami", "rhin", "rhod", "rupt", "scop", "sect", "sess", "self", "semi",
                    "sept", "serv", "somn", "soph", "spec", "spic", "spir", "tact", "tang", "taxo", "tele", "telo", "temp", "tent", "trit",
                    "term", "terr", "theo", "tort", "vent", "veri", "verb", "vers", "vert", "vice", "vivi", "voci", "voli", "volu", "vour",
                    "xeno", "xero", "xeri", "zygo"]
    gram_5_terms = ["amphi", "ambul", "andro", "antho", "arbor", "archi", "archa", "archi", "arthr", "astro", "aster", "audio", "belli",
                    "bibli", "blast", "ceive", "cardi", "carni", "caust", "celer", "centi", "centr", "chrom", "chron", "chrys", "claim",
                    "cline", "cogni", "corpo", "cosmo", "cumul", "dendr", "derma", "diplo", "domin", "donat", "dynam", "ethno", "extra",
                    "extro", "flect", "flora", "fleur", "fract", "funct", "gastr", "graph", "gress", "grade", "gradi", "hecto", "hecat",
                    "helic", "helio", "hepta", "herbi", "histo", "homeo", "hydro", "hygro", "hyper", "iatro", "icono", "infra", "inter",
                    "intra", "intro", "junct", "juven", "kinet", "lacto", "later", "leuko", "leuco", "liber", "lingu", "litho", "lumin",
                    "macro", "magna", "magni", "mania", "mater", "matri", "melan", "memor", "merge", "meter", "metry", "micro", "milli",
                    "morph", "multi", "necro", "nephr", "neuro", "nomin", "numer", "ortho", "osteo", "paleo", "pater", "patri", "penta",
                    "phage", "philo", "phono", "phone", "phony", "photo", "phyll", "phyto", "phyte", "plast", "plasm", "plaud", "plaus",
                    "pneum", "proto", "pseud", "psych", "pugna", "quadr", "quart", "quint", "radic", "radix", "radio", "retro", "rhino",
                    "rhodo", "rrhea", "rrhag", "scend", "scler", "scope", "scopy", "scrib", "septi", "somni", "spect", "stell", "super",
                    "terra", "terri", "tetra", "therm", "tract", "trans", "ultra", "vince", "xanth",
                    "cracy", "arian", "arium", "ation", "ative", "acity", "algia", "cycle", "esque", "iasis", "ology", "pathy", "phile",
                    "gonic", "loger", "otomy", "sophy", "scrip"]
    gram_6_terms = ["annenn", "arthro", "biblio", "blasto", "cardio", "centro", "centri", "cephal", "cerebr", "chromo", "chrono", "chryso",
                    "circum", "circle", "contra", "cranio", "crypto", "dendro", "dendri", "gastro", "graphy", "helico", "hetero", "melano",
                    "memori", "morpho", "nephro", "oxioxy", "phyllo", "pneumo", "pseudo", "psycho", "quadri", "rrhoea", "sclero", "script",
                    "sphere", "struct", "techno", "tempor", "thermo",
                    "aholic", "ectomy", "iatric", "phobia", "plegia", "plegic", "trophy", "logist", "ostomy", "scribe", "sophic"]
    gram_k_terms = ["anthrop", "cephalo", "cerebro", "contrao", "counter", "genesis", "kinemat", "termina", "escence", "ization",
                    "anthropo", "esthaesth"]
    multi_grams         = [gram_k_terms, gram_6_terms, gram_5_terms, gram_4_terms, gram_3_terms, gram_2_terms]
    multi_grams_weights = [           6,            5,            4,            3,            2,            1]

    lower_str = words.lower()
    feature_ret.append(str_len)                     # 1

    # divide word_len
    for idx, term in enumerate(single_vowel_map):
        single_vowel_cnt[idx] = lower_str.count(term)
        #single_vowel_cnt[idx] /= float(str_len)
    for idx, term in enumerate(double_vowel_map):
        double_vowel_cnt[idx] = lower_str.count(term)
        #double_vowel_cnt[idx] /= float(str_len)

    str_is_vowel = []
    vowel_consonant_cnt = [0, 0]
    for idx, char in enumerate(lower_str):
        is_vowel = 0
        if char in single_vowel_map:
            is_vowel = 1
            vowel_consonant_cnt[0] += 1
        else:
            vowel_consonant_cnt[1] += 1
        str_is_vowel.append(is_vowel)

    xaye = 0
    aaa  = 0
    xx   = 0
    for idx, char in enumerate(lower_str):
        if idx+3 < str_len and lower_str[idx+3] == "e":
            if str_is_vowel[idx] == 0 and str_is_vowel[idx+1] == 1 and str_is_vowel[idx+2] == 0:
                xaye += 1
        if idx+2 < str_len:
            if str_is_vowel[idx] == 1 and str_is_vowel[idx+1] == 1 and str_is_vowel[idx+2] == 1:
                aaa += 1
        if idx+1 < str_len:
            if lower_str[idx] == lower_str[idx+1] and str_is_vowel[idx] == 0 and str_is_vowel[idx+1] == 0:
                xx += 1

    feature_ret.append(xaye)                                    # 1
    feature_ret.append(aaa)                                     # 1
    feature_ret.append(xx)                                      # 1
    feature_ret.append(str_is_vowel[str_len-1])                 # 1
    feature_ret.extend(single_vowel_cnt)                        # 5
    feature_ret.extend(double_vowel_cnt)                        # 25
    feature_ret.append(sum(double_vowel_cnt))                   # 1
    feature_ret.extend(vowel_consonant_cnt)                     # 2

    each_grams_sum = []
    for idx, cur_grams in enumerate(multi_grams):
        cur_grams_match_ret = [0.0, 0.0, 0.0, 0.0]
        for idy, cur_gram in enumerate(cur_grams):
            fisrt_match = lower_str.find(cur_gram)
            last_match = lower_str.rfind(cur_gram)
            gram_match_ret = [0.0, 0.0, 0.0, 0.0]
            if fisrt_match >= 0 and last_match >= 0:
                if fisrt_match == 0:
                    gram_match_ret[0] += multi_grams_weights[idx]
                if fisrt_match != 0 and last_match != str_len - len(cur_gram):
                    gram_match_ret[1] += multi_grams_weights[idx]
                if last_match == str_len - len(cur_gram):
                    gram_match_ret[2] += multi_grams_weights[idx]
                gram_match_ret[3] += (fisrt_match + last_match) / float(str_len)
            ###feature_ret.extend(gram_match_ret)               # 4 * K
            for idy in range(len(cur_grams_match_ret)):
                cur_grams_match_ret[idy] += gram_match_ret[idy]
        feature_ret.extend(cur_grams_match_ret)                 # 6 * 4
        each_grams_sum.append(sum(cur_grams_match_ret))
    feature_ret.extend(each_grams_sum)                          # 6

    # ### bi-gram-ID
    # bigram_id = [-1, -1]
    # if str_len >= 2:
    #     bigram_id[0] = 27 * chars_map[lower_str[0]] + chars_map[lower_str[1]]
    #     bigram_id[1] = 27 * chars_map[lower_str[str_len-2]] + chars_map[lower_str[str_len-1]]
    # ### tri-gram-ID
    # trigram_id = [-1, -1]
    # if str_len >= 3:
    #     trigram_id[0] = 27 * 27 * chars_map[lower_str[0]] + 27 * chars_map[lower_str[1]] + chars_map[lower_str[2]]
    #     trigram_id[1] = 27 * 27 * chars_map[lower_str[str_len-3]] + 27 * chars_map[lower_str[str_len-2]] + chars_map[lower_str[str_len-1]]
    # feature_ret.extend(bigram_id)                              # 2
    # feature_ret.extend(trigram_id)                             # 2

    char_ratio = [0.0] * 27
    for char in lower_str:
        char_ratio[chars_map[char]] += 1.0
    char_ratio = [ch_cnt / str_len for ch_cnt in char_ratio]
    feature_ret.extend(char_ratio)                              # 27
    str_front_end = [0] * 27
    str_front_end[chars_map[lower_str[0]]] += 1
    str_front_end[chars_map[lower_str[str_len-1]]] += 1
    str_front_end = [ch_cnt / float(str_len) for ch_cnt in str_front_end]
    feature_ret.extend(str_front_end)                           # 27

    # sqar_feas = []
    # for val in feature_ret:
    #     sqar_feas.append(math.sqrt(float(val)))
    # feature_ret.extend(sqar_feas)                               # * 2

    return feature_ret

def SpecailHahsMux(hash_val, str_len):
    #print(hash_val, str_len, max_hash_limit)
    #return (hash_val % max_hash_limit, hash_val % off_set_base) # off set 2^k; k = 0, 1, 2
    bit_id = hash_val % (max_hash_limit * off_set_base)
    return (bit_id // off_set_base, bit_id % off_set_base) # off set 2^k; k = 0, 1, 2

def BKDRHash(words, str_len):
    int_seed  = 131313 # 31 131 1313 13131 131313 etc..
    int_hash  = 0
    safe_hash = js_max_safe_int // int_seed
    lower_str = words.lower()
    for idx in range(str_len):
        if int_hash > safe_hash:
            int_hash %= safe_hash
        int_hash = int_hash * int_seed + chars_map[lower_str[idx]]
        int_hash &= 0xffffffff
        #print(idx, int_hash, chars_map[lower_str[idx]])
    #hash_val = int_hash
    hash_val = int_hash & 0x7FFFFFFF
    return SpecailHahsMux(hash_val, str_len)

def APHash(words, str_len):
    int_hash = 0
    lower_str = words.lower()
    for idx in range(str_len):
        if (idx & 1) == 0:
            tmp_1 = (int_hash << 7) & 0xffffffff
            tmp_2 = (int_hash >> 3) & 0xffffffff
            int_hash ^= (tmp_1 ^ chars_map[lower_str[idx]] ^ tmp_2)
        else:
            tmp_1 = (int_hash << 11) & 0xffffffff
            tmp_2 = (int_hash >> 5) & 0xffffffff
            int_hash ^= (~(tmp_1 ^ chars_map[lower_str[idx]] ^ tmp_2))
        int_hash &= 0xffffffff
    #int_hash *= str_len
    hash_val = int_hash & 0x7FFFFFFF
    return SpecailHahsMux(hash_val, str_len)

def DJBHash(words, str_len):
    int_hash  = 5381
    shift_bit = 5
    lower_str = words.lower()
    for idx in range(str_len):
        tmp_1 = (int_hash << shift_bit) & 0xffffffff
        int_hash += tmp_1 + chars_map[lower_str[idx]]
        int_hash &= 0xffffffff
    #int_hash *= str_len
    hash_val = int_hash & 0x7FFFFFFF
    return SpecailHahsMux(hash_val, str_len)

def JSHash(words, str_len):
    int_hash = 1315423911
    lower_str = words.lower()
    for idx in range(str_len):
        tmp_1 = (int_hash << 5) & 0xffffffff
        tmp_2 = (int_hash >> 2) & 0xffffffff
        #print(idx, int_hash, tmp_1, tmp_2)
        int_hash ^= (tmp_1 + chars_map[lower_str[idx]] + tmp_2)
        int_hash &= 0xffffffff
        #print(idx, int_hash)
    #int_hash *= str_len
    hash_val = int_hash & 0x7FFFFFFF
    return SpecailHahsMux(hash_val, str_len)

def RSHash(words, str_len):
    b = 378551
    a = 63689
    int_hash = 0
    safe_hash_b = js_max_safe_int // b
    lower_str = words.lower()
    for idx in range(str_len):
        if int_hash * a > js_max_safe_int:
            int_hash %= js_max_safe_int // a
        int_hash = int_hash * a + chars_map[lower_str[idx]]
        int_hash &= 0xffffffff
        #print(idx, int_hash, a, b)
        if a > safe_hash_b:
            a %= safe_hash_b
        a *= b
        a &= 0xffffffff
    #int_hash *= str_len
    hash_val = int_hash & 0x7FFFFFFF
    return SpecailHahsMux(hash_val, str_len)

def SDBMHash(words, str_len):
    int_hash = 0
    lower_str = words.lower()
    for idx in range(str_len):
        int_hash = chars_map[lower_str[idx]] + (int_hash << 6) + (int_hash << 16) - int_hash
    #int_hash *= str_len
    hash_val = int_hash & 0x7FFFFFFF
    return SpecailHahsMux(hash_val, str_len)

def testJSandPYFeaturParser():
    ### Js init
    # get js runtime
    global js_feature_parsing_fc
    node = execjs.get(execjs.runtime_names.Node)
    #print "JS EXE:", node.name
    js_feature_parsing_fc = node.compile(loadJSscript("solution.js"))
    ### testing js feature parser...
    testing_size = 15
    start_base = 12345
    hash_order = ["BKD", "AP", "DJB", "JS", "RS", "SDBM"]
    # t_test_word_list = sorted(true_dict.items(), key=operator.itemgetter(0))[start_base:start_base + testing_size]
    # f_test_word_list = sorted(false_dict.items(), key=operator.itemgetter(0))[start_base:start_base + testing_size]
    print("Checking Features / Hashing Function (*6)... ")
    for cur_dict in [true_dict, false_dict]:
    # for cur_dict in [t_test_word_list, f_test_word_list]:
        for idx in range(testing_size):
        # for idx, key_val in enumerate(cur_dict):
        #     random_word = key_val[0]
        #     random_word_len = len(random_word)
            random_word = random.choice(list(cur_dict.keys()))
            random_word_len = len(random_word)
            correct_features = parseFeature(random_word, random_word_len)
            js_features = js_feature_parsing_fc.eval("parse_inputs(\"%s\", %d)" % (random_word, random_word_len))
            if not js_features == correct_features:
                print("")
                print("=== FEARURE VECTOR NOT MATCH ===")
                print("Word %s / %s" % (random_word, cur_dict[random_word]))
                print("js Fs", js_features, len(js_features))
                print("Py Fs", correct_features, len(correct_features))
                # for idx in range(len(correct_features)):
                #     if not correct_features[idx] == js_features[idx]:
                #         print(idx, correct_features[idx] - js_features[idx], correct_features[idx], js_features[idx])
                sys.exit()
            correct_hashs = [list(BKDRHash(random_word, random_word_len)),
                             list(APHash(random_word, random_word_len)),
                             list(DJBHash(random_word, random_word_len)),
                             list(JSHash(random_word, random_word_len)),
                             list(RSHash(random_word, random_word_len)),
                             list(SDBMHash(random_word, random_word_len))]
            js_hashs = [js_feature_parsing_fc.eval("BKDRHash(\"%s\", %d)" % (random_word, random_word_len)),
                        js_feature_parsing_fc.eval("APHash(\"%s\", %d)" % (random_word, random_word_len)),
                        js_feature_parsing_fc.eval("DJBHash(\"%s\", %d)" % (random_word, random_word_len)),
                        js_feature_parsing_fc.eval("JSHash(\"%s\", %d)" % (random_word, random_word_len)),
                        js_feature_parsing_fc.eval("RSHash(\"%s\", %d)" % (random_word, random_word_len)),
                        js_feature_parsing_fc.eval("SDBMHash(\"%s\", %d)" % (random_word, random_word_len))]
            for idy, cur_cmp in enumerate(hash_order):
                if not correct_hashs[idy] == js_hashs[idy]:
                    print("")
                    print("=== HASH FUNCTION NOT MATCH: %sHash %d / %d ===" % (cur_cmp, idx+1, testing_size))
                    print("Word %sHash(\"%s\", %d)" % (cur_cmp, random_word, random_word_len))
                    print('Py', correct_hashs[idy])
                    print('Js', js_hashs[idy])
                    sys.exit()
    print("Done")

def saveHashFile(feature_file_name):
    index_char = '('
    index_int  = ord(index_char)
    hash_list = [[] for idx in range(hashf_cnt)]
    hash_strs = []
    # make hashing
    # true_word_by_alhpa = {}
    # true_word_by_length = {}
    print("Making Hashing Keys... ", end = "")
    for key, val in true_dict.items():
        key_len = len(key)
        # if key_len not in true_word_by_length:
        #     true_word_by_length[key_len] = 1
        # else:
        #     true_word_by_length[key_len] += 1
        # start_alpha = key[0].lower()
        # if start_alpha not in true_word_by_alhpa:
        #     true_word_by_alhpa[start_alpha] = 1
        # else:
        #     true_word_by_alhpa[start_alpha] += 1
        upper_ch_ratio = sum(1 for char in key if char.isupper()) / float(key_len)
        is_start_ok = key[0].lower() in start_als_cond
        is_lengh_ok = key_len in length_cond
        if upper_ch_ratio <= ignore_UPPER_ratio and (is_start_ok and is_lengh_ok):
            #print(idx, key, DJBHash(key))
            if hashf_cnt-1 >= 0:
                hash_list[0].append(BKDRHash(key, key_len))          # list_1 - bit_0 -- val_1
            if hashf_cnt-1 >= 1:
                hash_list[1].append(JSHash(key, key_len))            # list_1 - bit_1 -- val_2
            if hashf_cnt-1 >= 2:
                hash_list[2].append(DJBHash(key, key_len))           # list_1 - bit_2 -- val_4
            if hashf_cnt-1 >= 3:
                hash_list[3].append(RSHash(key, key_len))            # list_1 - bit_0 -- val_1
            if hashf_cnt-1 >= 4:
                hash_list[4].append(APHash(key, key_len))            # list_1 - bit_1 -- val_2
            if hashf_cnt-1 >= 5:
                hash_list[5].append(SDBMHash(key, key_len))          # list_1 - bit_2 -- val_4
    print("Done")
    # for key, val in sorted(true_word_by_alhpa.items(), key=operator.itemgetter(1)):
    #     print("%7s = %9d" % (key, val))
    # for key, val in sorted(true_word_by_length.items(), key=operator.itemgetter(1)):
    #     print("%7d = %9d" % (key, val))
    #sys.exit()

    # hashing info
    out_str_list = list(index_char * max_hash_limit)
    for idx in range(hashf_cnt):
        ofset_c = {}
        hashing_cnt = len(hash_list[idx])
        print("hashing words     = %9d" % hashing_cnt)
        hash_list[idx] = set(hash_list[idx])
        hashing_size = len(hash_list[idx])
        print("hashing size      = %9d" % hashing_size)
        print("hashing collision = %9.7f" % ((hashing_cnt - hashing_size) / float(hashing_cnt)))
        print("hashing usage     = %9.7f" % (hashing_size / float(max_hash_limit * off_set_base)))
        for bit_item in hash_list[idx]:
            bit_idx = bit_item[0]
            off_set = bit_item[1]
            ori_val = ord(out_str_list[bit_idx])
            hash_vals = parseBits(ori_val - index_int)
            group_ofset = idx % hashf_group
            # if hashf_group != 1:
            #     off_set = 1
            # else:
            #     group_ofset = 1
            bit_value = 2 ** (group_ofset + off_set)
            if idx // hashf_group > 1:
                print(idx, hashf_group)
            hash_vals[idx // hashf_group] |= bit_value
            if bit_value not in ofset_c:
                ofset_c[bit_value] = 1
            else:
                ofset_c[bit_value] += 1
            add_val = 0
            decimal_v = 1
            for val in hash_vals:
                add_val += val * decimal_v
                decimal_v *= 10
            out_str_list[bit_idx] = chr(index_int + add_val)
        # for bit_idx in hash_list[idx]:
        #     ori_val = ord(out_str_list[bit_idx])
        #     add_val = int(2 ** (idx % hashf_group) * (10 ** (idx // hashf_group)))
        #     out_str_list[bit_idx] = chr(ori_val + add_val)
        if idx % 6 == 5:
            hash_strs.append("".join(out_str_list))
            out_str_list = list("0" * max_hash_limit)
        print(ofset_c)
        print("=====================================")
    if len(hash_list) % 6 != 0:
        hash_strs.append("".join(out_str_list))

    hash_file_name = "%s_hash_tabel" % feature_file_name[:feature_file_name.rfind(".")]
    with open(hash_file_name, "w") as fout:
        #print(hash_strs[0][:50])
        #json.dump({"bloom_filter": "\n".join(hash_strs)}, fout, sort_keys=True, indent=2)
        # data collecting
        bloom_filter = {}
        bloom_filter["BF_hs"]  = hash_strs[0]           # hash string
        bloom_filter["BF_sac"] = start_als_cond         # list
        bloom_filter["BF_lc"]  = length_cond            # list
        bloom_filter["BF_osb"] = off_set_base           # int
        bloom_filter["BF_hc"]  = hashf_cnt              # int
        bloom_filter["BF_hg"]  = hashf_group            # int
        bloom_filter["BF_iur"] = ignore_UPPER_ratio     # float
        bloom_filter["BF_mhl"] = max_hash_limit         # int
        json.dump(bloom_filter, fout)
        fout.close()
    print("Writing hashing table... Done [%s]" % hash_file_name)

    # write .gz file
    ftextin = open(hash_file_name, 'rb')
    gz_fname = '%s.gz' % hash_file_name
    with gzip.open(gz_fname, 'wb', 9) as fgzout:
        fgzout.writelines(ftextin)
        fgzout.close()
    ftextin.close()
    print("Compress hashing table to gz file... Done [%s]" % gz_fname)
    ret_ht_sz = os.path.getsize(hash_file_name) / 1000.0
    ret_htgz_sz = os.path.getsize(gz_fname) / 1000.0
    print("Size of %20s = %7.4f K-bytes" % (hash_file_name, ret_ht_sz))
    print("Size of %20s = %7.4f K-bytes" % (gz_fname, ret_htgz_sz))
    print("=====================================")


    hashv = [None for idx in range(hashf_cnt)]
    ofset = [None for idx in range(hashf_cnt)]
    true_cnt  = 0
    false_cnt = 0
    case_cnt  = 0
    true_correct  = 0
    false_correct = 0
    train_parsed_bits = [{} for idx in range(hashf_cnt)]
    global false_wrongs_and_notin
    false_wrongs_and_notin = []
    for key, val in false_dict.items():
        key_len = len(key)
        upper_ch_ratio = sum(1 for char in key if char.isupper()) / float(key_len)
        is_start_ok = key[0].lower() in start_als_cond
        is_lengh_ok = key_len in length_cond
        if upper_ch_ratio <= ignore_UPPER_ratio and (is_start_ok and is_lengh_ok):
            false_cnt += 1
            if hashf_cnt-1 >= 0:
                hashv[0], ofset[0] = BKDRHash(key, key_len)
                hashv[0] = parseBits(ord(hash_strs[0][hashv[0]]) - index_int)
            if hashf_cnt-1 >= 1:
                hashv[1], ofset[1] = JSHash(key, key_len)
                hashv[1] = parseBits(ord(hash_strs[0][hashv[1]]) - index_int)
            if hashf_cnt-1 >= 2:
                hashv[2], ofset[2] = DJBHash(key, key_len)
                hashv[2] = parseBits(ord(hash_strs[0][hashv[2]]) - index_int)
            if hashf_cnt-1 >= 3:
                hashv[3], ofset[3] = RSHash(key, key_len)
                hashv[3] = parseBits(ord(hash_strs[0][hashv[3]]) - index_int)
            if hashf_cnt-1 >= 4:
                hashv[4], ofset[4] = APHash(key, key_len)
                hashv[4] = parseBits(ord(hash_strs[0][hashv[4]]) - index_int)
            if hashf_cnt-1 >= 5:
                hashv[5], ofset[5] = SDBMHash(key, key_len)
                hashv[5] = parseBits(ord(hash_strs[0][hashv[5]]) - index_int)
            predict = True
            for idx in range(hashf_cnt):
                # if '**'.join([str(v) for v in hashv[idx]]) not in train_parsed_bits[idx]:
                #     train_parsed_bits[idx]['**'.join([str(v) for v in hashv[idx]])] = 1
                # else:
                #     train_parsed_bits[idx]['**'.join([str(v) for v in hashv[idx]])] += 1
                group_ofset = idx % hashf_group
                # if hashf_group != 1:
                #     ofset[idx] = 1
                # else:
                #     group_ofset = 1
                #if (hashv[idx][idx // hashf_group] & ((2 ** group_ofset) ** ofset[idx])) == 0:
                if (hashv[idx][idx // hashf_group] & (2 ** (group_ofset + ofset[idx]))) == 0:
                    predict = False
                    break
            if predict == False:
                false_correct += 1
            else:
                false_wrongs_and_notin.append(key)
        else:
            false_wrongs_and_notin.append(key)
    # for idx in range(hashf_cnt):
    #     for key, val in sorted(train_parsed_bits[idx].items(), key=operator.itemgetter(1)):
    #         print(idx, key, val)
    #     print("----------")

    test_parsed_bits = [{} for idx in range(hashf_cnt)]

    global true_not_in
    true_not_in = []
    for key, val in true_dict.items():
        key_len = len(key)
        upper_ch_ratio = sum(1 for char in key if char.isupper()) / float(key_len)
        is_start_ok = key[0].lower() in start_als_cond
        is_lengh_ok = key_len in length_cond
        if upper_ch_ratio <= ignore_UPPER_ratio and (is_start_ok and is_lengh_ok):
            true_cnt += 1
            if hashf_cnt-1 >= 0:
                hashv[0], ofset[0] = BKDRHash(key, key_len)
                hashv[0] = parseBits(ord(hash_strs[0][hashv[0]]) - index_int)
            if hashf_cnt-1 >= 1:
                hashv[1], ofset[1] = JSHash(key, key_len)
                hashv[1] = parseBits(ord(hash_strs[0][hashv[1]]) - index_int)
            if hashf_cnt-1 >= 2:
                hashv[2], ofset[2] = DJBHash(key, key_len)
                hashv[2] = parseBits(ord(hash_strs[0][hashv[2]]) - index_int)
            if hashf_cnt-1 >= 3:
                hashv[3], ofset[3] = RSHash(key, key_len)
                hashv[3] = parseBits(ord(hash_strs[0][hashv[3]]) - index_int)
            if hashf_cnt-1 >= 4:
                hashv[4], ofset[4] = APHash(key, key_len)
                hashv[4] = parseBits(ord(hash_strs[0][hashv[4]]) - index_int)
            if hashf_cnt-1 >= 5:
                hashv[5], ofset[5] = SDBMHash(key, key_len)
                hashv[5] = parseBits(ord(hash_strs[0][hashv[5]]) - index_int)
            predict = True
            for idx in range(hashf_cnt):
                # if '**'.join([str(v) for v in hashv[idx]]) not in test_parsed_bits[idx]:
                #     test_parsed_bits[idx]['**'.join([str(v) for v in hashv[idx]])] = 1
                # else:
                #     test_parsed_bits[idx]['**'.join([str(v) for v in hashv[idx]])] += 1
                group_ofset = idx % hashf_group
                # if hashf_group != 1:
                #     ofset[idx] = 1
                # else:
                #     group_ofset = 1
                #if (hashv[idx][idx // hashf_group] & ((2 ** group_ofset) ** ofset[idx])) == 0:
                if (hashv[idx][idx // hashf_group] & (2 ** (group_ofset + ofset[idx]))) == 0:
                    predict = False
                    break
            if predict == True:
                true_correct += 1
        else:
            true_not_in.append(key)
    # for idx in range(hashf_cnt):
    #     for key, val in sorted(test_parsed_bits[idx].items(), key=operator.itemgetter(1)):
    #         print(idx, key, val)
    #     print("----------")

    case_cnt = true_cnt + false_cnt
    prdict_correct = true_correct + false_correct
    ret_acc = prdict_correct / float(case_cnt)
    ret_tru_acc = true_correct / float(true_cnt)
    ret_fal_acc = false_correct / float(false_cnt)
    print("Collecting false_wrongs_and_notin data = %7d / %7d" % (len(false_wrongs_and_notin), false_cnt))
    print("Case cnts = %7d / %7d / %7d" % (true_cnt, false_cnt, case_cnt))
    print("Accuracy  = %7.5f / %7.5f / %7.5f" % (ret_tru_acc, ret_fal_acc, ret_acc))
    #sys.exit()
    return [off_set_base, max_hash_limit, '%7.4f' % ret_ht_sz, '%7.4f' % ret_htgz_sz, '%7.5f' % ret_tru_acc, '%7.5f' % ret_fal_acc, '%7.5f' % ret_acc]

def parseBits(hash_val):
    # previous ver: split into 10 * X + Y
    groups = hashf_cnt // hashf_group
    dicimal_bits = []
    if groups == 1:
        dicimal_bits.append(hash_val)
    else:
        dicimal_bits.append(hash_val % 10)
        dicimal_bits.append(hash_val // 10)
    return dicimal_bits

def saveFeatureFile(feature_file_name, test_limit):
    all_fv_label = []
    true_input = 0
    false_input = 0
    idx = 0
    #for key, val in true_dict.items():
    for key in true_not_in:
        key_len = len(key)
        # upper_ch_ratio = sum(1 for char in key if char.isupper()) / float(key_len)
        # is_start_ok = key[0].lower() in start_als_cond
        # is_lengh_ok = key_len in length_cond
        # if upper_ch_ratio <= ignore_UPPER_ratio and not (is_start_ok and is_lengh_ok):
        true_input += 1
        cur_fv_label = parseFeature(key, key_len)
        cur_fv_label.append(1)
        all_fv_label.append(cur_fv_label)
        idx += 1
        if test_limit != -1 and idx >= test_limit:
            break
        if idx % show_meg == 0:
            print("current true: %d" % idx)
    idx = 0
    #for key, val in false_dict.items():
    for key in false_wrongs_and_notin:
        key_len = len(key)
        false_input += 1
        cur_fv_label = parseFeature(key, key_len)
        cur_fv_label.append(-1)
        all_fv_label.append(cur_fv_label)
        idx += 1
        if test_limit != -1 and idx >= test_limit:
            break
        if idx % show_meg == 0:
            print("current false: %d" % idx)

    all_fv_label = np.array(all_fv_label, dtype = float)
    ### shuffling ...
    id_ordering = [idx for idx in range(len(all_fv_label))]
    random.shuffle(id_ordering)
    all_fv_label = all_fv_label[id_ordering, :]

    features = np.delete(all_fv_label, np.s_[-1:], 1)
    label = np.delete(all_fv_label, np.s_[:-1], 1).transpose()[0]
    #WriteIntoNpArray("%s.txt" % feature_file_name, features, label)
    WriteIntoPickle(feature_file_name, features, label)
    print("Number of True inputs:  %7d" % true_input)
    print("Number of False inputs: %7d" % false_input)
    print("Writing feature pkl... Done [%s]" % feature_file_name)

def FindTerm(this_dict, term):
    if term in this_dict:
        print("yes", this_dict[term])
    else:
        print("no")

def loadJSscript(js_script):
    string_code = ""
    with open(js_script) as fin:
        for line in fin.readlines():
            string_code += line
    return string_code

def getInputList(option = 0):
    ret_list = []
    source = get_public_testdata.input_dir
    if option == 1:
        source = get_public_testdata.test_dir
    for file in os.listdir(source):
        cur_file_path = os.path.join(source, file)
        if os.path.isfile(cur_file_path):
            ret_list.append(cur_file_path)
    return ret_list

def WriteIntoNpArray(file, d_f, d_t):
    """writing into file
        Vars. format:
            d_f:                 d_t:
            [[x1,x2,x3, ... x_fz]   [y1,y2,y3, ... y_dz]
             [x1,x2,x3, ... x_fz]
             ...
             [x1,x2,x3, ... x_fz]]
    """
    d_all = (np.concatenate((d_f, d_t[:, None]), axis=1))
    np.savetxt(file, d_all, fmt = '%.7f', delimiter=',')

def WriteIntoPickle(file, d_f, d_t):
    """writing into file
        Vars. format:
            d_all = [d_f, d_t]
            d_f:                 d_t:
            [[x1,x2,x3, ... x_fz]   [y1,y2,y3, ... y_dz]
             [x1,x2,x3, ... x_fz]
             ...
             [x1,x2,x3, ... x_fz]]
    """
    with open(file, 'wb') as fout:
        pck.dump([d_f, d_t], fout, True)

class Args(object):
    args = None
    def __init__(self):
        self.args = self.ParaSet()
        print(self.args)
    def ParaSet(self):
        argparser = argparse.ArgumentParser(description='make_feature.py -f OUTPUT_PKL_FILE -l NUMBER_OF_WORDS_BE_SAVED')
        argparser.add_argument('-d',  '--datapath',    type=str, default='K:\\',          help='path to generated feature.pkl dir')
        argparser.add_argument('-f',  '--featurefile', type=str, default='test-1.pkl',    help='file name of generated feature.pkl')
        argparser.add_argument('-l',  '--limit',       type=int, default=-1,              help='number of words to parsing, default -1 is all')
        argparser.add_argument('-m',  '--maxhash',     type=int, default=302217,          help='max value of one hash table[600000]')
        argparser.add_argument('-o',  '--offset',      type=int, default=3,               help='off_set_base[3]')
        argparser.add_argument('-c',  '--cnthashf',    type=int, default=1,               help='hashf_cnt[2]')
        argparser.add_argument('-g',  '--grouphashf',  type=int, default=1,               help='hashf_group[hashf_group <= 3 & hashf_cnt / hashf_group <= 2]')
        argparser.add_argument('-p',  '--partdata',    type=int, default=1,               help='use part data to generate feature')
        cur_args = argparser.parse_args()
        cur_args = vars(cur_args)
        return cur_args

def InitSettings(arg_max_hash, arg_offset, arg_cnthashf, arg_grouphashf, arg_partdata):
    # chars_map init
    global chars_map
    chars_map = {}
    for idx, char in enumerate(string.ascii_lowercase):
        chars_map[char] = idx
    chars_map['\''] = 26
    global max_hash_limit, show_meg, ignore_UPPER_ratio, hashf_cnt, hashf_group, off_set_base
    max_hash_limit = arg_max_hash
    ignore_UPPER_ratio = 1.0
    hashf_cnt = arg_cnthashf
    hashf_group = arg_grouphashf
    off_set_base = arg_offset

    global start_als_cond, length_cond
    if arg_partdata:
        #start_als_cond = ["s", "c", "p", "a", "m", "b", "t", "d", "r", "u"]
        start_als_cond = ["s", "c", "p", "a", "m", "b", "t", "d", "r", "u", "h", "e"]
        #length_cond    = [  9,   8,  10,   7,  11,   6,  12,  13,   5,  14]
        length_cond    = [  9,   8,  10,   7,  11,   6,  12,  13,   5,  14,  15,   4]
    else:
        # selecting all
        start_als_cond = list(string.ascii_lowercase)
        length_cond    = [l for l in range(61)]
        ignore_UPPER_ratio = 1.0

    print("max_hash_limit     = %9d" % max_hash_limit)
    print("show_meg           = %9d" % show_meg)
    print("ignore_UPPER_ratio = %9.7f" % ignore_UPPER_ratio)
    print("off_set_base       = %9d" % off_set_base)
    print("hashf_cnt          = %9d" % hashf_cnt)
    print("hashf_group        = %9d" % hashf_group)
    print("start_als_cond     = %s" % " ".join(start_als_cond))
    print("length_cond        = %s" % " ".join([str(l) for l in length_cond]))

def main():
    global total_case
    global max_hash_limit, off_set_base, hashf_cnt, hashf_group
    global start_als_cond, length_cond, ignore_UPPER_ratio

    paras = Args()
    InitSettings(paras.args["maxhash"], paras.args["offset"], paras.args["cnthashf"], paras.args["grouphashf"], paras.args["partdata"])
    file_list = getInputList(0)
    AddTrueInput()
    AddFalseInput(file_list)
    print("Number of files:       %7d" % len(file_list))
    print("Number of True cases:  %7d" % len(true_dict))
    print("Number of False cases: %7d" % len(false_dict))
    print("Number of Total cases: %7d" % total_case)
    total_case = len(true_dict) + len(false_dict)
    print("True Ratio: %7.5f False Ratio: %7.5f" % (len(true_dict) / float(total_case), len(false_dict) / float(total_case)))
    print("=====================================")
    # Testing
    """
    FindTerm(true_dict, "synoptists")
    FindTerm(false_dict, "synoptists")
    FindTerm(true_dict, "frontispira")
    FindTerm(false_dict, "frontispira")
    """
    print("ignore_UPPER_ratio %5.3f" % ignore_UPPER_ratio)

    # ....EXP....
    ###all_or_part = ["new_ret_all"]
    # all_or_part = ["new_ret", "new_ret_all"]
    # for sval in all_or_part:
    #     ofset_list  = list(range(1, 3, 1))                                                  # oxxx
    #     hashf_cnt   = 5                                                                     # cX
    #     hashf_group = 5                                                                     # gX
    #     if sval == "new_ret_all":
    #         ignore_UPPER_ratio = 1.0                                                        # igXXX
    #         start_als_cond = list(string.ascii_lowercase)
    #         length_cond    = [l for l in range(61)]
    #     else:
    #         ignore_UPPER_ratio = 0.4                                                        # igXXX
    #         start_als_cond = ["s", "c", "p", "a", "m", "b", "t", "d", "r", "u", "h", "e"]   # st12
    #         length_cond    = [  9,   8,  10,   7,  11,   6,  12,  13,   5,  14,  15,   4]   # len12
    #     exp_name = "%s_ig%03d_st%d_len%d_o%s_c%d_g%d" % (sval, int(ignore_UPPER_ratio * 100),
    #                                                      len(start_als_cond), len(length_cond),
    #                                                      "".join(str(v) for v in ofset_list),
    #                                                      hashf_cnt, hashf_group)
    #     with open(exp_name, "w") as fout:
    #         for test_ho in ofset_list:
    #             gap = 10000
    #             for test_max_hs in list(range(10000, 510000, gap)):
    #                 off_set_base = test_ho
    #                 max_hash_limit = test_max_hs + random.randint(0, gap / 2 - 1)
    #                 fout.write(" ".join(["%10s" % str(val) for val in saveHashFile(paras.args['featurefile'])]) + "\n")
    #         fout.close()
    #     print(exp_name)
    # sys.exit()

    #testJSandPYFeaturParser()
    saveHashFile(paras.args['featurefile'])
    #sys.exit()
    saveFeatureFile(os.path.join(paras.args['datapath'], paras.args['featurefile']), paras.args["limit"])

if __name__ == '__main__':
    main()
