/*
 * Hola word classifier challenge
 *
 * Gabriel Vijiala < gabriel.vijiala@gmail.com >
 * May, 2016
 */

#include <iostream>
#include <cstring>
#include <algorithm>
#include "Scorer.h"
#include "Error.h"

void Scorer::writeBits(const Encoder *encoder, const std::string& filename, bool trim) {
    evalBits(encoder);
    if(trim) {
        trimBits(encoder);
    }
    std::ofstream fout(filename, std::ios::binary);
    if(!fout.is_open()) {
        throw Error(filename + " not opened");
    }

    int n = encoder->getNumBits();
    int m = n / 8 + 1;
    std::cerr << "Saving " << m << " bytes to " << filename << ". That's " << (1 + m / (1<<10)) << "K. ";
    char *bytes = new char[m];
    memset(bytes, 0, (size_t) m);
    for(int i = 0; i < n; i+=8) {
        for(int j = 0; j < 8; j++) {
            bytes[i / 8] |= (bitset[i + j] << j);
        }
    }
    fout.write(bytes, m);
    delete[] bytes;

    int count = 0;
    for(int i = 0; i < n; i++) {
        count += bitset[i];
    }
    std::cerr << "Fill rate: " << (float) count / n << std::endl;

    fout.close();

    std::ofstream f2(filename + "_first_bits");

    f2 << "First 24 bits: ";
    for(int i = 0; i < 24; i++) {
        f2 << bitset[i] << " ";
    }
    f2 << std::endl;
    f2.close();
}

float Scorer::scoreBits(const Encoder *encoder) {
    int good = 0;
    int bad = 0;
    int false_positives = 0;
    int false_negatives = 0;

    data.applyRandom([&, this, encoder] (std::pair<std::string&, bool&> p){
        Encoder::param r = (*encoder)(p.first) % Encoder::MOD;
        bool b = bitset[r];
        if(b == p.second) {
            good += 1;
        } else {
            bad += 1;
            if(b) {
                false_positives += 1;
            } else {
                false_negatives += 1;
            }
        }
    });
//    std::cerr << "false positives: " << false_positives << " / " << bad << std::endl;
    return (float) good / (good + bad);
}

float Scorer::score(const Encoder *encoder, bool trim) {
    evalBits(encoder);
    if(trim) {
        trimBits(encoder);
    }
    return scoreBits(encoder);
}

Scorer::Scorer(Data& data): data(data) {

}

void Scorer::evalBits(const Encoder *encoder) {
    bitset.reset();
    data.applyWords([encoder, this](const std::string &x) {
        Encoder::param pos = (*encoder)(x) % Encoder::MOD;
        bitset[pos] = 1;
    });
}

void Scorer::trimBits(const Encoder *encoder) {
    int *nums = new int[encoder->MAX_BITS];
    memset(nums, 0, sizeof(int) * encoder->MAX_BITS);

    data.applyWords([nums, encoder](const std::string &x) {
        Encoder::param pos = (*encoder)(x) % Encoder::MOD;
        nums[pos] += 1;
    });

//    int num_words = 0;
    std::vector<int> positions;
    for(int i = 0; i < encoder->MAX_BITS; i++) {
        if(nums[i] != 0) {
            positions.push_back(i);
//            num_words += nums[i];
        }
    }

    std::sort(positions.begin(), positions.end(), [nums](int a, int b) {
        return nums[a] > nums[b];
    });

    int k = 0;
    while(positions.size() > lowTrim * encoder->MAX_BITS && !positions.empty()) {
        int z = positions.back();
        k += nums[z];
        bitset[z] = 0;
        positions.pop_back();
    }

    delete[] nums;
    positions.clear();
}







