/*
 * Hola word classifier challenge
 *
 * Gabriel Vijiala < gabriel.vijiala@gmail.com >
 * May, 2016
 */

#include <sstream>
#include <algorithm>
#include <fstream>
#include <iostream>
#include "Data.h"
#include "Error.h"

std::random_device rd;
std::minstd_rand rng(rd());
std::uniform_int_distribution<int> goodDistribution;
std::uniform_int_distribution<char> letterDistribution;
std::uniform_int_distribution<char> coin;

Data::Data(std::string filename) {
    std::cerr << filename;
    std::ifstream in(filename);
    if (!in.is_open()) {
        throw Error(filename.append(" didn't open"));
    }
    std::string s;
    while (in >> s) {
        std::transform(s.begin(), s.end(), s.begin(), ::tolower);
        words.push_back(s);
        hash[s] = lex(s);
    }
    in.close();
    std::cerr << " ... done" << std::endl;

    goodDistribution = std::uniform_int_distribution<int>(0, (int) words.size() - 1);
    letterDistribution = std::uniform_int_distribution<char>('a', 'z' + 1);
    coin = std::uniform_int_distribution<char>(0, 1);
    std::cerr << "Read " << words.size() << " words. Rand = " << goodDistribution(rng) << std::endl;
}


long Data::lex(std::string s) {
    long val = 0;
    const long pow = 28;
    std::replace(s.begin(), s.end(), '\'', (char) ('z' + 1));
    for (int c: s) {
        c = c - 'a' + 1;
        val = val * pow + c;
    }

    return val;
}


void Data::applyWords(const std::function<void(const std::string &)> &func) const {
    for (const std::string &s: words) {
        func(s);
    }
}

std::string Data::nonsense() {
    std::stringstream s;
    int n = rand() % 7 + 2;
    for (int i = 0; i < n; i++) {
        s << letterDistribution(rng);
    }
    return s.str();
}

std::string Data::addenum() {
    std::stringstream s;
    if (coin(rng)) {
        s << selectGoodWord();
        if (coin(rng)) {
            s << nonsense();
        } else {
            s << selectGoodWord();
        }
    } else {
        s << nonsense();
        if (coin(rng)) {
            s << nonsense();
        } else {
            s << selectBadWord();
        }
    }
    return s.str();
}

std::string Data::selectGoodWord() {
    int i = goodDistribution(rng);
    return words[i];
}

std::string Data::selectBadWord() {
    switch (rand() % 4) {
        case 0:
            return addenum();
        case 1:
            return nonsense();
        case 2:
            return interchange();
        case 3:
            return deleteletters();
    }
    if (coin(rng) == 0) {
        return addenum();
    } else {
        return nonsense();
    }
}

void Data::applyRandom(const std::function<void(const std::pair<std::string &, bool &> &)> &func, int num_tests) {
    std::string dummystr;
    bool dummybool = false;
    std::pair<std::string &, bool &> pair(dummystr, dummybool);
    for (int i = 0; i < num_tests; i++) {
        if (coin(rng)) {
            pair.first = selectGoodWord();
            pair.second = true;
        } else {
            pair.first = selectBadWord();
            pair.second = false;
        }
        func(pair);
//        std::cout << pair.first << " " << pair.second << std::endl;
    }
}

std::string Data::interchange() {
    std::string word = selectGoodWord();
    int i, j;
    i = rand() % (int) word.size();
    j = rand() % (int) word.size();
    std::swap(word[i], word[j]);
    return word;
}

std::string Data::deleteletters() {
    std::string word = selectGoodWord();
    unsigned long int j = rand() % std::min((unsigned long int) word.size(), 2ul);
    unsigned long int i = rand() % (word.size() - j);
    word.erase(i, j);
    return word;
}



















