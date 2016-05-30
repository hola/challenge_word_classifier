/*
 * Hola word classifier challenge
 *
 * Gabriel Vijiala < gabriel.vijiala@gmail.com >
 * May, 2016
 */

#ifndef HOLA_BLOOM_CLASSIFIER_SCORER_H
#define HOLA_BLOOM_CLASSIFIER_SCORER_H

#include <bitset>
#include <fstream>
#include "Encoder.h"
#include "Data.h"

class Scorer {
private:
    float lowTrim = 0.40;
    Data& data;
    std::bitset<Encoder::MAX_BITS> bitset;
    void evalBits(const Encoder *encoder);
    float scoreBits(const Encoder *encoder);
    void trimBits(const Encoder *encoder);
public:
    void writeBits(const Encoder *encoder, const std::string& filename, bool trim = false);
    float score(const Encoder *encoder, bool trim = false);
    Scorer(Data &data);

};


#endif //HOLA_BLOOM_CLASSIFIER_SCORER_H
