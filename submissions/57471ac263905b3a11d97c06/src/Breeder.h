/*
 * Hola word classifier challenge
 *
 * Gabriel Vijiala < gabriel.vijiala@gmail.com >
 * May, 2016
 */

#ifndef HOLA_BLOOM_CLASSIFIER_BREEDER_H
#define HOLA_BLOOM_CLASSIFIER_BREEDER_H

#include <algorithm>
#include "Scorer.h"
#include "Utils.h"
#include "Error.h"


constexpr size_t POPULATION_SIZE = 250;

template<class Hash, size_t N = POPULATION_SIZE, bool TRIM = false>
class Breeder {
    typedef std::pair<Hash *, float> Pair;
    std::minstd_rand rand_engine{make_seeded_engine()};
    std::uniform_int_distribution<int> item{0, N - 1};
    std::uniform_real_distribution<float> unit{0, 1};

    Scorer &scorer;

    std::vector<Pair> generation;
    std::vector<Pair> best;
    std::vector<bool> savedBest;

    float probCrossOver = 0.60;
    float probMutate = 0.25;
    float probInit = 0.05;

    std::vector<Hash *> selectIndividuals() {
        float max = generation[0].second;
        std::vector<Hash *> res;

        for (size_t i = 1; i <= N; i++) {
            int k = item(rand_engine);
            float rel = generation[k].second / max;
            if (rel > unit(rand_engine)) {
                res.push_back(generation[k].first);
            } else {
                --i;
            }
        }
        return res;
    }

    void advanceGeneration() {
        std::vector<Hash *> selected = selectIndividuals();
        std::vector<Hash *> mutated;

        // elitism++
        Hash *q = new Hash();
        Encoder::clone(q, getBest().first);
        mutated.push_back(q);

        for (int i = 1; i < (int) N; i++) {
            Hash *e = new Hash();

            int a = item(rand_engine);
            float u = unit(rand_engine);
            if (i < (int) N - 1 && u < probCrossOver) {
                // do crossover
                int b = item(rand_engine);
                Encoder::crossOver(e, selected[a], selected[b]);
            } else if (u < probCrossOver + probMutate) {
                // do mutate
                Encoder::mutate(e, selected[a]);
            } else if (u < probCrossOver + probMutate + probInit) {
                e->init();
            } else {
                Encoder::clone(e, selected[a]);
            }
            mutated.push_back(e);
        }

        for (Pair &e: generation) {
            delete e.first;
        }
        generation.clear();

        for (Hash *e: mutated) {
            generation.push_back(std::make_pair(e, scorer.score(e, TRIM)));
        }

        std::sort(generation.begin(), generation.end(), [](const Pair &p1, const Pair &p2) {
            return p1.second > p2.second;
        });

        Hash *e = new Hash();
        Encoder::clone(e, getBest().first);
        best.push_back(std::make_pair(e, getBest().second));
        savedBest.push_back(false);
        std::cerr << "Generation done. Best score = " << getBest().second
        << ". Worst score = " << getWorst().second << std::endl;
    }

public:

    ~Breeder() {
        clear();
    }

    Breeder(Scorer &scorer) : scorer(scorer) {
        for (size_t i = 0; i < N; i++) {
            Hash *e = new Hash();
            e->init();
            generation.push_back(std::make_pair(e, scorer.score(e, TRIM)));
        }
    }

    void clear() {
        for (Pair &e: generation) {
            delete e.first;
        }

        for (Pair &e: best) {
            delete e.first;
        }

        generation.clear();
        best.clear();
        savedBest.clear();
    }

    void save(const std::string &name, const std::string &folder, bool strip = false) {
        Pair p;
        char buf[100];
        if (strip) {
            p = best[best.size() - 1];
            sprintf(buf, "%s/hash", folder.c_str());
            Encoder::serialize(p.first, buf);
            sprintf(buf, "%s/bits", folder.c_str());
            scorer.writeBits(p.first, buf, TRIM);
            return;
        }

        for (int i = 1; i <= (int) best.size(); i++) {
            if (savedBest[i - 1]) continue;
            p = best[i - 1];
            float score = p.second;
            sprintf(buf, "%s/score_%03d__gen_%03d__%s.hash",
                    folder.c_str(),
                    (int) std::round(score * 10000),
                    i,
                    name.c_str());
            Encoder::serialize(p.first, buf);

            sprintf(buf, "%s/score_%03d__gen_%03d__%s.bits",
                    folder.c_str(),
                    (int) std::round(score * 10000),
                    i,
                    name.c_str());
            scorer.writeBits(p.first, buf, TRIM);
            savedBest[i - 1] = true;
        }
    }

    void load(const std::string &name, const std::string &folder) {
        throw Error("Not implemented");
    }

    void advanceGenerations(int k) {
        for (int i = 0; i < k; i++) {
            advanceGeneration();
        }
    }

    std::pair<Hash *, float> getBest() {
        return generation[0];
    };

    std::pair<Hash *, float> getWorst() {
        return generation[generation.size() - 1];
    };
};


#endif //HOLA_BLOOM_CLASSIFIER_BREEDER_H
