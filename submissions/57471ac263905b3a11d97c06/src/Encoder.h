/*
 * Hola word classifier challenge
 *
 * Gabriel Vijiala < gabriel.vijiala@gmail.com >
 * May, 2016
 */

#ifndef HOLA_BLOOM_CLASSIFIER_ENCODING_H
#define HOLA_BLOOM_CLASSIFIER_ENCODING_H

#include <string>
#include <vector>
#include <fstream>
#include <iostream>

class Encoder {
public:
    typedef unsigned long long param;

//    static constexpr int MAX_BITS =  8550000;
    static constexpr int MAX_BITS =  500001;
//    static constexpr int MAX_BITS = (1 << 19)-1 + 1000;
    static constexpr param MOD = MAX_BITS;
protected:

    std::vector<param*> params;
    int num_bits = MAX_BITS;
public:

    static void clone(Encoder *dest, Encoder *source);
    static void crossOver(Encoder *dest, Encoder *a, Encoder *b);
    static void mutate(Encoder *dest, Encoder *source);
    static void deserialize(Encoder *dest, const std::string& filename);
    static void serialize(Encoder *source, const std::string& filename);

    virtual ~Encoder() {};
    virtual param operator()(const std::string &s) const = 0;
    virtual param operator()(const std::string &s, std::ostream& o) const {
        return this->operator()(s);
    };

    virtual void init() = 0;


    int getNumBits() const {
        return num_bits;
    }

};

class FnvEncoder: public Encoder {
public:

    param offset;
    param prime;

    FnvEncoder(): Encoder() {
        params.clear();
        params.push_back(&offset);
        params.push_back(&prime);
    }

    virtual void init() override {
        offset = static_cast<param>(rand() % MOD);
        prime = static_cast<param>(rand() % MOD);
    }



    virtual param operator()(const std::string &s) const override {
        param k = offset;
        for(const char &c : s) {
            k *= prime;
            k %= MOD;
            k ^= c;
            k %= MOD;
        }
        return k;
    };

    virtual param operator()(const std::string &s, std::ostream& o) const override {
        param k = offset;
        o << std::endl;
        o << "k = " << k << std::endl;
        for(const char &c : s) {
            o << "k = " << k << " * " << prime << " % " << MOD << " = ";
            k *= prime;
            k %= MOD;
            o << k << std::endl;

            o << "k = " << k << " ^ " << (int) c << " % " << MOD << " = ";
            k ^= c;
            k %= MOD;
            o << k << std::endl;
        }
        o << "finally k = " << k << std::endl;
        return k;
    };
};

class FnvSpinoff: public Encoder {
public:

    param offset;
    param prime;
    param adder;

    FnvSpinoff(): Encoder() {
        params.clear();
        params.push_back(&offset);
        params.push_back(&prime);
        params.push_back(&adder);
    }

    virtual void init() override {
        offset = static_cast<param>(rand() % MOD);
        prime = static_cast<param>(rand() % MOD);
        adder = static_cast<param>(rand() % MOD);
    }


    virtual param operator()(const std::string &s) const override {
        param k = offset;
        for(const char &c : s) {
            k *= prime;
            k %= MOD;
            k ^= c;
            k %= MOD;
            k += adder;
            k %= MOD;
        }
        return k;
    };

    virtual param operator()(const std::string &s, std::ostream& o) const override {
        return operator()(s);
    }
};


#define ROT32(x, y) ((x << y) | (x >> (32 - y))) // avoid effort


class Murmur3Encoder: public Encoder {
public:
    param seed;

    Murmur3Encoder(): Encoder() {
        params.clear();
        params.push_back(&seed);
    }

    virtual void init() override {
        seed = static_cast<param>(rand() % MOD);
    }

    virtual param operator()(const std::string &s) const override {
        return murmur3_32(s.c_str(), (uint32_t) s.size(), (uint32_t) seed);
    };


    uint32_t murmur3_32(const char *key, uint32_t len, uint32_t seed) const {
        static const uint32_t c1 = 0xcc9e2d51;
        static const uint32_t c2 = 0x1b873593;
        static const uint32_t r1 = 15;
        static const uint32_t r2 = 13;
        static const uint32_t m = 5;
        static const uint32_t n = 0xe6546b64;

        uint32_t hash = seed;

        const int nblocks = len / 4;
        const uint32_t *blocks = (const uint32_t *) key;
        int i;
        uint32_t k;
        for (i = 0; i < nblocks; i++) {
            k = blocks[i];
            k *= c1;
            k = ROT32(k, r1);
            k *= c2;

            hash ^= k;
            hash = ROT32(hash, r2) * m + n;
        }

        const uint8_t *tail = (const uint8_t *) (key + nblocks * 4);
        uint32_t k1 = 0;

        switch (len & 3) {
            case 3:
                k1 ^= tail[2] << 16;
            case 2:
                k1 ^= tail[1] << 8;
            case 1:
                k1 ^= tail[0];

                k1 *= c1;
                k1 = ROT32(k1, r1);
                k1 *= c2;
                hash ^= k1;
            default:
                break;
        }

        hash ^= len;
        hash ^= (hash >> 16);
        hash *= 0x85ebca6b;
        hash ^= (hash >> 13);
        hash *= 0xc2b2ae35;
        hash ^= (hash >> 16);

        return hash;
    }
};


#endif //HOLA_BLOOM_CLASSIFIER_ENCODING_H
