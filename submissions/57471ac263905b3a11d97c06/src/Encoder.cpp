/*
 * Hola word classifier challenge
 *
 * Gabriel Vijiala < gabriel.vijiala@gmail.com >
 * May, 2016
 */

#include "Encoder.h"
#include "Error.h"
#include <random>

void Encoder::serialize(Encoder *source, const std::string &filename) {
    std::ofstream file(filename);
    if(!file.is_open()) {
        throw Error(filename + " not opened");
    }

    for (param *x: source->params) {
        file << *x << std::endl;
    }

    file << std::endl;
    file << "hash(goodlord) = " << (*source)("goodlord", file) << std::endl;
    file.close();
}

void Encoder::deserialize(Encoder *dest, const std::string &filename) {
    std::ifstream file(filename);
    if(!file.is_open()) {
        throw Error(filename + " not opened");
    }

    for (param *a: dest->params) {
        file >> *a;
    }
    file.close();
}

void Encoder::clone(Encoder *dest, Encoder *source) {
    for (int i = 0; i < (int) source->params.size(); i++) {
        *(dest->params[i]) = *(source->params[i]);
    }
}

void Encoder::crossOver(Encoder *dest, Encoder *a, Encoder *b) {
    int N = (int) dest->params.size();
    int to = rand() % N;

    for (int k = 0; k < N; k++) {
        if(k < to) {
            // Take the stuff from a
            *(dest->params[k]) = *(a->params[k]);
        } else {
            // Take the stuff from b
            *(dest->params[k]) = *(b->params[k]);
        }
    }
}

void Encoder::mutate(Encoder *dest, Encoder *source) {
    clone(dest, source);
    int N = (int) dest->params.size();

    for (param *x: dest->params) {
        if (rand() % N == 0) {
            *x = static_cast<param>(rand() % MOD);
        }
    }

}

