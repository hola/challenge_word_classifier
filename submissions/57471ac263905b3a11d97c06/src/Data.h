/*
 * Hola word classifier challenge
 *
 * Gabriel Vijiala < gabriel.vijiala@gmail.com >
 * May, 2016
 */

#ifndef HOLA_BLOOM_CLASSIFIER_DATA_H
#define HOLA_BLOOM_CLASSIFIER_DATA_H

#include <map>
#include <string>
#include <vector>
#include <functional>
#include <utility>
class Data {

private:

    std::map<std::string, long> hash;
    std::vector<std::string> words;
    std::string nonsense();
    std::string addenum();
    std::string selectGoodWord();
    std::string selectBadWord();
    std::string interchange();
    std::string deleteletters();

public:
    static const int constexpr DEFAULT_TESTS = 45000;
    Data(std::string filename);
    long lex(std::string s);
    void applyWords(const std::function<void(const std::string &)> &func) const;
    void applyRandom(const std::function<void(const std::pair<std::string&, bool&> &)> &func, int num_tests = DEFAULT_TESTS);
};


#endif //HOLA_BLOOM_CLASSIFIER_DATA_H
