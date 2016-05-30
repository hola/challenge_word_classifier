/*
 * Hola word classifier challenge
 *
 * Gabriel Vijiala < gabriel.vijiala@gmail.com >
 * May, 2016
 */

#include <iostream>
#include "Data.h"
#include "Scorer.h"
#include "Breeder.h"

using namespace std;

int main() {
    Data data("words.txt");
    Scorer scorer(data);

//    Breeder<Murmur3Encoder, 45, true> b1(scorer);
    Breeder<FnvEncoder, 60, true> b1(scorer);
    for(int i = 0; i < 5; i++) {
        b1.advanceGenerations(3);
        b1.save("fnv", "bins/fnv");
        b1.save("fnv", "js/data", true);
    }

    return 0;
}