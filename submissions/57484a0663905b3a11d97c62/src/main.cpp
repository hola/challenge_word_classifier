#include <fstream>
#include <iostream>

#include <stdexcept>

#include <cmath>

#include <algorithm>
#include <map>
#include <set>
#include <string>
#include <vector>

using namespace std;

//const size_t bloomSize = 459983;
const size_t bloomSize = 502122;
const size_t bloomPrefixSize = 8; // TODO: 8

vector<float> bigramProbability;

size_t bigramIndex(const string& bigram) {
    return (bigram[0] - 'a') * 26 + bigram[1] - 'a';
}

map<string, size_t> testedMap;
size_t tested = 0;

uint64_t hashString(const string& word) {
    const uint64_t constants[] = {/* 27644437,*/ 115249, 33391, 108301, 115249};

    uint64_t result = 0;
    for (auto i : word) {
        result = ((result + i) * constants[0] + constants[1]) % bloomSize;
    }
    return result;
}

void setBloom(const string& word, vector<int>& bloom) {
    string prefix = word;
    if (prefix.size() > bloomPrefixSize)
        prefix = prefix.substr(0, bloomPrefixSize);
    ++bloom[hashString(prefix)];
}
void unsetBloom(const string& word, vector<int>& bloom, int k) {
    string prefix = word;
    if (prefix.size() > bloomPrefixSize)
        prefix = prefix.substr(0, bloomPrefixSize);
    bloom[hashString(prefix)] -= k;
}
bool testBloom(const string& word, const vector<int>& bloom) {
    string prefix = word;
    if (prefix.size() > bloomPrefixSize)
        prefix = prefix.substr(0, bloomPrefixSize);
    return (bloom[hashString(prefix)] > 0);
}

bool testVowel(char i) {
    if (i == 'a' || i == 'e' || i == 'i' || i == 'o' || i == 'u' || i =='y')
        return true;
    return false;
}

size_t countConsolantSeq(const string& word) {
    size_t bestCount = 0;
    size_t n = word.size();
    for (size_t i = 0; i < n; ++i) {
        size_t j = i;
        while (j < n && testVowel(word[j]))
            ++j;
        bestCount = max(bestCount, j - i);
    }
    return bestCount;
}
size_t countVowelSeq(const string& word) {
    size_t bestCount = 0;
    size_t n = word.size();
    for (size_t i = 0; i < n; ++i) {
        size_t j = i;
        while (j < n && !testVowel(word[j]))
            ++j;
        bestCount = max(bestCount, j - i);
    }
    return bestCount;
}

size_t countAp(const string& word) {
    size_t count = 0;
    for (auto i : word)
        if (i == '\'')
            ++count;
    return count;
}

bool testTripple(const string& word) {
    size_t n = word.size();
    for (size_t i = 2; i < n; ++i) {
        if (word[i] == word[i - 1] && word[i] == word[i - 2])
            return true;
    }
    return false;
}

size_t countLetter(const string& word) {
    set<char> l;
    for (auto i : word)
        l.insert(i);
    return l.size();
}

void initTested() {
    tested = 0;
    testedMap.clear();
}

bool testWord(const string& word, const vector<int>& bloom, bool isWord) {
    ++tested;
    size_t count = ++testedMap[word];
    if (count > 6 && count > tested * 6 / 690000)
        return false;
    if (tested > 1350 * 1000 && count < 1.01 + tested / 6.0 / 690000) {
        return false;
    }

    if (tested < testedMap.size() * 2 && testedMap.size() > 1000 * 1000 * 100) {
        map<string, size_t> newMap;
        tested = 0;
        for (auto i : testedMap) {
            if (i.second > 1) {
                newMap[i.first] = i.second;
                tested += i.second;
            }
        }
        testedMap = newMap;
    }

    size_t n = word.size();
    string wordForBloom = word;
    bool isSword = false;

    if (n > 2 && word[n - 1] == 's' && word[n-2] == '\'') {
        wordForBloom = word.substr(0, n - 2);
        isSword = true;
    }
    size_t m = isSword
        ? n - 2
        : n;
    size_t containAp = countAp(word);

    if (n == 3 && isSword)
        return true;
    if (n < 3 && containAp)
        return false;
    if (n == 1)
        return true;
    if (!testBloom(wordForBloom, bloom))
        return false;
    if (n < 3)
        return true;
    if (containAp && !isSword)
        return false;
    if (containAp > 1)
        return false;

    if (testTripple(word) && n > 3)
        return false;

    set<string> blacks = {"dg", "dw", "tk", "tw", "xh", "wh", "cl", "nr", "dn", "tn", "br", "pr", "gl", "cr", "tr"};
    if (blacks.find(word.substr(m - 2, 2)) != blacks.end())
        return false;
    if (word[n-1] == 'q')
        return false;

    size_t consolantSeq = countConsolantSeq(word);
    size_t vowelSeq = countVowelSeq(word);
    if (consolantSeq > 5)
        return false;
    if (vowelSeq > 5)
        return false;

    float bigramProbSum = 0.0;
    float bigramProb = 1.0;
    float bigramSqrt = 0.0;
    if (bigramProbability[bigramIndex(word.substr(0, 2))] < 4.9e-6)
        return false;
    for (size_t i = 1; i < m; ++i) {
        float probability = bigramProbability[bigramIndex(word.substr(i - 1, 2))];
        bigramProbSum += probability;
        bigramProb *= probability;
        bigramSqrt += sqrt(probability);
    }
    bigramProb = log(bigramProb);
    if (n > 18) {
        return false;
    }
    float bigramProbMax[] = {
        -21,
        -25,
        -33, // 5
        -40,
        -45,
        -52,
        -57,
        -63, // 10
        -69,
        -71,
        -72,
        -72,
        -74, // 15
        -80,
        -67,
        -73,
    };
    if (bigramProb < bigramProbMax[n - 3]) {
        return false;
    }

    if (m > 13 && bigramProb < bigramProbMax[m - 3]) {
        return false;
    }
    float bigramSumMin[] = {
        0.6,
        0.8,
        1.2, // 10
        1.5,
        2.4,
        3.5,
        4.3,
        6.0, // 15
        8.0,
        12.,
        17.,
    };
    if (m >= 8) {
        if (bigramProbSum * 73 < bigramSumMin[m - 8]) {
            return false;
        }
    }

    float bigramSumSqrt[] = {
        0.29, // 9
        0.36, // 10
        0.42,
        0.57,
        0.7,
        0.86,
        1.05, // 15
        1.22,
        0.,
        0.,
    };

    if (m > 8 && bigramSqrt < bigramSumSqrt[m - 9]) {
        return false;
    }

/*
    vector<float> changedBigramProb;
    for (size_t i = 0; i < 2; ++i) {
        string wordC = word;
        for (size_t c = 'a'; c <= 'z'; ++c) {
            wordC[i] = c;

            float bigramProb = 0.0;
            for (size_t i = 1; i < m; ++i) {
                float probability = bigramProbability[bigramIndex(wordC.substr(i - 1, 2))];
                bigramProb += probability;
            }
//            bigramProb = log(bigramProb);
            changedBigramProb.push_back(bigramProb);
        }
    }
    sort(changedBigramProb.begin(), changedBigramProb.end());
    size_t index = 0;
    for (size_t i = 0; i < changedBigramProb.size(); ++i) {
        if (changedBigramProb[i] < bigramProbSum)
            ++index;
    }
//    if (static_cast<float>(index) / changedBigramProb.size() > 0.96)
//    if (static_cast<float>(index) / changedBigramProb.size() < 0.30)
//        return false;
*/
    return true;
}

void addBigram(const string& word, map<string, size_t>& biMap) {
    size_t n = word.size();
    for (size_t i = 1; i < n; ++i) {
        string bi;
        bi += word[i - 1];
        bi += word[i];
        ++biMap[bi];
    }
}

void addTrigram(const string& word, map<string, size_t>& triMap) {
    size_t n = word.size();
    for (size_t i = 2; i < n; ++i) {
        string bi;
        bi += word[i - 2];
        bi += word[i];
        ++triMap[bi];
    }
}

vector<float> countProbabilityBigram(map<string, size_t> bigramCount) {
    size_t summary = 0;
    for (auto& i : bigramCount) {
        if (i.second > 65535) {
            i.second = 65535;
        }
        summary += i.second;
    }
    summary += 40000;
    ofstream probabilitiesFile("bigrams.bin", ios::binary);
    for (char c1 = 'a'; c1 <= 'z'; ++c1) {
        for (char c2 = 'a'; c2 <= 'z'; ++c2) {
            string bi;
            bi += c1;
            bi += c2;
            uint16_t count = static_cast<uint16_t>(bigramCount[bi]);
            probabilitiesFile.write(reinterpret_cast<char*>(&count), 2);
        }
    }

    cerr << "summary: " << summary << endl;
    vector<float> result(26 * 26);
    for (auto i : bigramCount) {
        result[bigramIndex(i.first)] = 1.0 * i.second / summary;
    }
    return result;
}

void printBiStat(const string& word, bool isWord) {
    float bigramProbSum = 0.0;
    float bigramProb = 1.0;
    float bigramSquare = 0.0;
    float bigramSqrt = 0.0;
    size_t n = word.size();
    if (n < 3)
        return ;
    if (n > 25)
        return ;
    for (size_t i = 1; i < n; ++i) {
        float probability = bigramProbability[bigramIndex(word.substr(i - 1, 2))];
        bigramProbSum += probability;
        bigramProb *= probability;
        bigramSquare += probability * probability;
        bigramSqrt += sqrt(probability);
    }
    bigramProb = log(bigramProb);
//    bigramSquare = log(bigramSquare);
//    bigramSqrt = log(bigramSqrt);
    cout << "sum: " << isWord << " " << bigramProbSum << ' ' << n << '\n';
    cout << "prob: " << isWord << " " << bigramProb << ' ' << n << '\n';
    cout << "square: " << isWord << " " << bigramSquare << ' ' << n << '\n';
    cout << "sqrt: " << isWord << " " << bigramSqrt << ' ' << n << '\n';
}

int main(int argc, char *argv[]) {
    if (argc < 2) {
        cerr << "usage: " << argv[0] << " DIR" << endl;
        return 1;
    }

    size_t countTrashOk = 0;
    size_t countTrashFail = 0;
    size_t countWordsOk = 0;
    size_t countWordsFail = 0;

    string lex;

    string dictionaryFilename = "words-3.txt";
    ifstream dictionaryFile(dictionaryFilename.c_str());
    set<string> dictionary;

    map<string, size_t> wordsBi;
    map<string, size_t> wordsTri;

    while (dictionaryFile >> lex) {
        dictionary.insert(lex);
        addBigram(lex, wordsBi);
        addTrigram(lex, wordsTri);
    }

    bigramProbability = countProbabilityBigram(wordsBi);

    vector<int> filledBloom(bloomSize, true);
    vector<int> bloom(bloomSize);
    size_t ok = 0;
    size_t fail = 0;
    for (auto i : dictionary) {
        if (testWord(i, filledBloom, true)) {
            ++ok;
            setBloom(i, bloom);
        } else {
            ++fail;
        }
    }
    cerr << ok << ' ' << fail << endl;
    string dir = argv[1];
    string trashFile = dir + "/trash.list";
    string wordsFile = dir + "/words.list";
    ifstream trash(trashFile.c_str());
    ifstream trash2(trashFile.c_str());
    ifstream words(wordsFile.c_str());

    map<string, size_t> trashMisCount;
    while (trash >> lex) {
        if (testWord(lex, bloom, false)) {
            ++trashMisCount[lex];
        }
    }
    for (auto i : trashMisCount) {
        if (i.second > 1) {
            string word = i.first;
            size_t n = word.size();
            if (word.size() > 2 && word.substr(n - 2, 2) == "'s")
                word = word.substr(0, n - 2);
            unsetBloom(word, bloom, i.second);
        }
    }
    vector<bool> realBloom(bloomSize);
    for (size_t i = 0; i < bloomSize; ++i)
        realBloom[i] = bloom[i] > 0;

    vector<uint8_t> values;
    for (size_t i = 0; i < bloomSize; i += 8) {
        uint8_t value = 0;
        for (size_t j = 0; j < 8; ++j) {
            value = value << 1;
            if (i + j < bloomSize)
                value = value | realBloom[i + j];
        }
        values.push_back(value);
    }
    ofstream bloomFilter("bloom.bin");
    for (auto i : values)
        bloomFilter << i;
    while (trash2 >> lex) {
//        printBiStat(lex, false);
        if (testWord(lex, bloom, false)) {
            ++countTrashFail;
            if (rand() < 100000)
                cerr << lex << endl;
        } else {
            ++countTrashOk;
        }
        initTested();
    }
    cerr << "----" << endl;
    while (words >> lex) {
//        printBiStat(lex, true);
        if (testWord(lex, bloom, true)) {
            ++countWordsOk;
        } else {
            ++countWordsFail;
            if (rand() < 300000)
                cerr << lex << endl;
        }
        initTested();
    }

    float precisionTrash = 100.0 * countTrashOk / (countTrashOk + countTrashFail);
    float precisionWords = 100.0 * countWordsOk / (countWordsOk + countWordsFail);
    float precision = 100.0 * (countTrashOk + countWordsOk) / (countTrashOk + countTrashFail + countWordsFail + countWordsOk);
    cout << "Trash: " << precisionTrash << " " << countTrashOk << " : " << countTrashFail << endl;
    cout << "Words: " << precisionWords << " " << countWordsOk << " : " << countWordsFail << endl;
    cout << "Precision: " << precision << endl;

    countTrashOk = 0;
    countTrashFail = 0;
    countWordsOk = 0;
    countWordsFail = 0;

    initTested();
    while (cin >> lex) {
        for (size_t i = 0; i < 100; ++i) {
            if (!(cin >> lex))
                break;
            bool res = testWord(lex.substr(1, lex.size() - 3), bloom, 0);
            cin >> lex;
            if (lex[0] == 't') {
                if (res) {
                    ++countWordsOk;
                } else {
                    ++countWordsFail;
                }
            } else {
                if (res) {
                    ++countTrashFail;
                } else {
                    ++countTrashOk;
                }
            }
        }
    }
    precisionTrash = 100.0 * countTrashOk / (countTrashOk + countTrashFail);
    precisionWords = 100.0 * countWordsOk / (countWordsOk + countWordsFail);
    precision = 100.0 * (countTrashOk + countWordsOk) / (countTrashOk + countTrashFail + countWordsFail + countWordsOk);
    cout << "Trash: " << precisionTrash << " " << countTrashOk << " : " << countTrashFail << endl;
    cout << "Words: " << precisionWords << " " << countWordsOk << " : " << countWordsFail << endl;
    cout << "Precision: " << precision << endl;
    return 0;
}
