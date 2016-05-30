#pragma once

#include <string>
#include <assert.h>

using namespace std;

uint32_t fnv1a(const char *str, size_t len);
uint32_t djb2(const char *str, size_t len);
uint32_t murmur2(const char *str, size_t len);

class bloom_filter
{
public:
    bloom_filter(int count_elements = 0, double bits_per_element = 10)
    {
        mem = NULL;
        init(count_elements, bits_per_element);
        hash_collisions = 0;
        count_0 = count_1 = count_collisions = 0;
        added_count = 0;
        hh[0] = fnv1a;
        hh[1] = djb2;
        hh[2] = murmur2;
    }
    ~bloom_filter()
    {
        delete[] mem;
        delete[] mem32;
        delete[] mem32x;
    }

    void init_sz(int count_elements, int bytes, int hashes = 0)
    {
        assert(!mem);
        count_0 = sz = bytes*8;
        m_tested_count = 0;
        if (hashes <= 0)
            hashes = (int)round(log(2.0) * sz / count_elements);
        if (hashes <= 0)
            hashes = 1;
        this->hashes = hashes;
    }
    void init(int count_elements, double bits_per_element, int hashes = 0)
    {
        assert(!mem);
        count_0 = sz = (uint32_t)(count_elements*bits_per_element + 0.5);
        m_tested_count = 0;
        if (hashes <= 0)
            hashes = (int)round(log(2.0) * sz / count_elements);
        if (hashes <= 0)
            hashes = 1;
        this->hashes = hashes;
    }

    void add(const std::string &str)
    {
        add(str.data(), str.size());
    }

    void add(const char *str, size_t len)
    {
        if (len <= 0)
            return;
        added_count++;
        if (!mem)
            init();
        add(hh[0](str, len));
        if (hashes > 1)
            add(hh[1](str, len));
        if (hashes > 2)
            add(hh[2](str, len));
    }

    bool test(const string &str)
    {
        return test(str.data(), str.size());
    }

    bool test(const char *str, size_t len)
    {
        //m_tested[string(str, len)] = 1;
        //m_tested_count++;

        if (!test(hh[0](str, len)))
            return false;
        if (hashes > 1 && !test(hh[1](str, len)))
            return false;
        if (hashes > 2 && !test(hh[2](str, len)))
            return false;
        return true;
        //return test(fnv1a(str, len)) && (hashes!=2 || test(djb2(str, len)));
    }
    bool test(uint32_t h)
    {
        h %= sz;
        if (0 != (mem[h / 8] & (1u << (h % 8))))
        {
            mem32x[h]++;
            return true;
        }
        return false;
    }
    bool test2(uint32_t h)
    {
        h %= sz;
        if (0 != (mem[h/8] & (1u << (h%8))))
            return true;
        return false;
    }
    void train(double rate = 1.856)
    {
        for (unsigned i=0; i<sz; ++i)
        {
            if (mem32x[i] > mem32[i]*rate)
                mem[i/8] &= ~(1u << (i%8));
        }
    }

    int mem_size() const
    {
        return (sz + 7) / 8;
    }

    void save_to_file(const char *filename) const
    {
        FILE *file = fopen(filename, "wb");
        fwrite(mem, 1, mem_size(), file);
        fclose(file);
    }

    void save_to_buffer(uint8_t *buf) const
    {
        memcpy(buf, mem, mem_size());
    }

    map<string, int> m_tested;
    int m_tested_count;

private:
    void init()
    {
        mem = new uint8_t[sz/8+8];
        mem32 = new uint32_t[sz];
        mem32x = new uint32_t[sz];
        memset(mem, 0, sz/8+8);
        memset(mem32, 0, 4*sz);
        memset(mem32x, 0, 4*sz);
    }
    void add(uint32_t h)
    {
        if (test(h))
            count_collisions++;
        else
        {
            count_1++;
            count_0--;
        }
        h %= sz;
        mem32[h]++;
        mem[h/8] |= (1u << (h%8));
    }

public:
    uint32_t sz;
    uint32_t hash_collisions;
    uint32_t count_0, count_1, count_collisions;
    uint32_t added_count;
    uint8_t *mem;
    uint32_t *mem32, *mem32x;
    typedef uint32_t(*hash_fun)(const char *str, size_t len);
    hash_fun hh[3];
    int hashes;

    bloom_filter(const bloom_filter &rhs) : mem(NULL), mem32(NULL), mem32x(NULL)
    {
        *this = rhs;
    }

    bloom_filter& operator=(const bloom_filter &rhs)
    {
        delete[] mem;
        delete[] mem32;
        delete[] mem32x;

        m_tested = rhs.m_tested;
        m_tested_count = rhs.m_tested_count;
        sz = rhs.sz;
        hash_collisions = rhs.hash_collisions;
        count_0 = rhs.count_0;
        count_1 = rhs.count_1;
        count_collisions = rhs.count_collisions;
        added_count = rhs.added_count;
        memcpy(hh, rhs.hh, sizeof(hh));
        hashes = rhs.hashes;
        mem = new uint8_t[sz/8+8];
        mem32 = new uint32_t[sz];
        mem32x = new uint32_t[sz];
        memcpy(mem, rhs.mem, sz/8+8);
        memcpy(mem32, rhs.mem32, 4*sz);
        memcpy(mem32x, rhs.mem32x, 4*sz);
        return *this;
    }
};
