/*
 * Hola word classifier challenge
 *
 * Gabriel Vijiala < gabriel.vijiala@gmail.com >
 * May, 2016
 */

#ifndef HOLA_BLOOM_CLASSIFIER_UTILS_H
#define HOLA_BLOOM_CLASSIFIER_UTILS_H

#include <random>

template<class E=std::minstd_rand>
inline E make_seeded_engine() {
    std::random_device r;
    std::seed_seq seed{r(), r(), r(), r(), r(), r(), r(), r()};
    return E(seed);
}

#endif /* HOLA_BLOOM_CLASSIFIER_UTILS_H */
