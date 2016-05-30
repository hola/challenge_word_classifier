#pragma once

#include <algorithm>
#include <iostream>
#include <string.h>
#include <vector>
#include <map>
#include <list>
#include "bloom_filter.h"
#include "scoped_timer.h"
#include "word_stats.h"

using namespace std;

bool vowel(char c);
bool consonant(char c);
string stem(const string &str);

template<int C>
bool type(char c)
{
    return C ? vowel(c) : consonant(c);
}

struct input_t
{
    string word, root;
    bool is_english;
};
struct ok_err_t
{
    ok_err_t() : i_ok(0), i_err(0), i_dict_sz(0), p_ok(0.0), p_err(0.0), prob(0) {}

    string ok, err;
    size_t i_ok, i_err, i_dict_sz;
    double p_ok, p_err;
    double prob;
};

const int N = 27;
