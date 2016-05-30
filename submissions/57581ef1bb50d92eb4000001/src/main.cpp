#undef NDEBUG
#include <assert.h>
#include <map>
#include <unordered_map>
#include <vector>
#include <string>
#include <set>
#include <iostream>
#include <fstream>
#include <array>
#include <algorithm>
#include <stdint.h>
#include <boost/filesystem.hpp>
#include "state.h"
// #include "vld.h"

using namespace std;
using namespace boost;

struct state;
struct x_state;
void calculate_xx_dict(x_state *st, bool use_root);
template<class T>bool test(x_state *st, const T &word, unsigned max_len);
void suffix_stats(const char *suffix, state &st);
int stem_int(char *str, size_t len);
int stem_int(char *str);
void to_stem(string &str)
{
    size_t len = stem_int((char*)str.data(), str.size());
    str.resize(len);
}
string stem(const char *str)
{
    string ret = str;
    to_stem(ret);
    return ret;
}
string stem(const string &str)
{
    return stem(str.c_str());
}
uint32_t murmur2(const void * key, size_t len, uint32_t seed = 0);
bool check_english(const string &word, const string &root, bool is_english, state &st);
int estimate_bloom(vector<ok_err_t> &counts, int *rows, int rows_count, int total_bits, int bit_step);

int root_size_6 = 0;
map<string, int> root_size_6_map;
map<string, int> bf_zz_6_map;
int bf_zz_6_total = 0, bf_zz_6_ok = 0, bf_zz_6_err = 0, bf_zz_6_err_neg = 0, bf_zz_6_ok_r = 0, bf_zz_6_err_r = 0;
int bf_zz_6_root_total_match = 0, bf_zz_6_best_total_match = 0;

int CHAR_TAB[256] = { 0 }; // maps chars to [0, 27) range
void init_char_tab()
{
    if (CHAR_TAB['a'])
        return;
    for (int i='a'; i<='z'; ++i)
        CHAR_TAB[i] = 1+i-'a';
}

void to_lower(char *s, char *s_end)
{
    for (; s<s_end; ++s)
    {
        if (*s>='A' && *s<='Z')
            *s -= 'A'-'a';
    }
}

void to_lower(string &s)
{
    to_lower(&s[0], &s[0]+s.size());
}

bool vowel(char c)
{
    return c == 'a' || c == 'e' || c == 'i' || c == 'o' || c == 'u';
}
bool not_vowel(char c)
{
    return c != 'a' && c != 'e' && c != 'i' && c != 'o' && c != 'u';
}
bool consonant(char c)
{
    return not_vowel(c)/* && c != '\''*/;
}
bool not_consonant(char c)
{
    return c=='a' || c=='e' || c=='i' || c=='o' || c=='u' || c=='\'';
}

void to_vowels(string & str)
{
    string::iterator e = remove_if(str.begin(), str.end(), not_vowel);
    str.resize(str.size()-(str.end()-e));
}

void to_consonants(string & str)
{
    string::iterator e = remove_if(str.begin(), str.end(), not_consonant);
    str.resize(str.size()-(str.end()-e));
}

double get_bloom_probability(int bytes, int elements)
{
    return (1-pow(exp(1), ((bytes*8)*log(1.0 / (pow(2.0, log(2.0))))) / elements));
}

pair<int, int> calc_bloom_filter(int items, double probability)
{
    int m = (int)ceil((items * log((100-probability)/100)) / log(1.0 / (pow(2.0, log(2.0)))));
    int k = (int)round(log(2.0) * m / items);
    return make_pair(m, k);
}

uint32_t fnv1a(const char *str, size_t len)
{
    uint32_t h = 2166136261u;
    for (const char *e=str+len; str<e; ++str)
        h = (h ^ str[0]) * 16777619u;
    return h;
}

uint32_t djb2(const char *str, size_t len)
{
    uint32_t h = 5381;
    for (const char *e=str+len; str<e; ++str)
        h = ((h<<5) + h) + str[0];
    return h;
}

uint32_t murmur2(const char *str, size_t len)
{
    return murmur2(str, len, 0);
}

uint32_t murmur2(const void * key, size_t len, uint32_t seed)
{
    const uint32_t m = 0x5bd1e995;
    uint32_t h = seed ^ (uint32_t)len;

    const unsigned char * data = (const unsigned char *)key;

    while (len >= 4)
    {
        uint32_t k;

        k = data[0];
        k |= data[1] << 8;
        k |= data[2] << 16;
        k |= data[3] << 24;

        k *= m;
        k ^= k >> 24;
        k *= m;

        h *= m;
        h ^= k;

        data += 4;
        len -= 4;
    }

    switch (len)
    {
    case 3: h ^= data[2] << 16;
    case 2: h ^= data[1] << 8;
    case 1: h ^= data[0];
        h *= m;
    };

    h ^= h >> 13;
    h *= m;
    h ^= h >> 15;

    return h;
}

void markov_test();
bool check_non_english100(const string &word, bool is_english, state &st);

void load_json(const char *filename, word_stats &ws)
{
    char buf[4096];
    int wordcount = 0;
    FILE *file = fopen(filename, "rb");
    while (fgets(buf, sizeof(buf), file))
    {
        size_t len = strlen(buf)-1; // faster than using using ftell
        if (len > 3)
        {
            wordcount++;
            char *q = (char*)memchr(buf+3, '"', len-3);
            bool is_english = q[3]=='t';
            ws.add_word(buf+3, q, is_english);
        }
    }
    fclose(file);
    assert(wordcount == 100);
}

void load_samples(const char *dir, word_stats &ws)
{
    using namespace boost::filesystem;
    scoped_timer st("load_samples");
    path test_data(dir);
    for (auto it = directory_iterator(test_data); it != directory_iterator(); ++it)
        load_json(it->path().string().c_str(), ws);
}

void load_words(const char *words_file, word_stats &ws)
{
    scoped_timer st("load_words");
    FILE *fl = fopen(words_file, "rb");
    char buf[4096];
    while (fgets(buf, sizeof(buf), fl))
    {
        size_t len = strlen(buf)-1; // faster than using ftell
        buf[len] = 0;
        to_lower(buf, buf+len);
        ws.add_word(buf, buf+len);
    }
    fclose(fl);
}

void save_dict6(uint32_t tab3[N][N][N], const char *name)
{
    uint8_t b1[(26*26*26+7)/8] = {0};
    for (int i=1; i<N; ++i)
        for (int j=1; j<N; ++j)
            for (int k=1; k<N; ++k)
            {
                bool val = 0!=tab3[i][j][k];
                if (!val)
                    continue;
                int pos = (i-1)*26*26 + (j-1)*26 + (k-1);
                int offset = pos/8;
                int bit = pos%8;
                b1[offset] |= 1u<<(pos%8);
            }
    FILE *fl = fopen(name, "wb");
    fwrite(b1, 1, sizeof(b1), fl);
    fclose(fl);
}

void save_dict6(uint32_t tab3[N][N][N], uint8_t *b1)
{
    memset(b1, 0, (26*26*26+7)/8);
    for (int i=1; i<N; ++i)
    {
        for (int j=1; j<N; ++j)
        {
            for (int k=1; k<N; ++k)
            {
                bool val = 0!=tab3[i][j][k];
                if (!val)
                    continue;
                int pos = (i-1)*26*26 + (j-1)*26 + (k-1);
                int offset = pos/8;
                int bit = pos%8;
                b1[offset] |= 1u<<(pos%8);
            }
        }
    }
}

#define ends_with(s, str) (s.size()>sizeof(str)) && (0==s.compare(s.size()-(sizeof(str)-1), (sizeof(str)-1), str, (sizeof(str)-1)))
#define erase_end(s, str) s.resize(s.size()-sizeof(str))

// calculate probability of wrong becoming correct without trailing 's
double get_probability_traling_s_trim_err(x_state *st, const word_stats &dict, const word_stats &ws)
{
    const word_stats::words_map_t words = ws.words;
    int total = 0, err_trailing_s = 0;
    for (auto it=ws.words_list_err.begin(); it!=ws.words_list_err.end(); ++it)
    {
        const word_stats::word_stats_t *w = *it;
        if (ends_with(w->word, "'s"))
        {
            total++;
            word_stats::string s(w->word.begin(), w->word.end()-2);
            if (test(st, w->word, 20))
            if (dict.words.find(&s) != dict.words.end())
                err_trailing_s++;
        }
    }
    return (0.0+err_trailing_s)/total;
}

// calculate probability of wrong becoming correct when comparing by root
double get_probability_root_err(x_state *st, const word_stats &dict, const word_stats &ws)
{
    const word_stats::words_map_t words = ws.words;
    int err_roots = 0;
    for (auto it=ws.words_list_err.begin(); it!=ws.words_list_err.end(); ++it)
    {
        const word_stats::word_stats_t *w = *it;
        if (test(st, w->word, 20))
        if (dict.roots.find(&w->root->root) != dict.roots.end())
            err_roots++;
    }
    return (0.0+err_roots)/ws.words_list_err.size();
}

// calculate probability of correct becoming wrong without trailing 's
double get_probability_traling_s_err(const word_stats &ws)
{
    const word_stats::words_map_t words = ws.words;
    int total = 0, err_trailing_s = 0;
    for (auto it=ws.words_list_english.begin(); it!=ws.words_list_english.end(); ++it)
    {
        const word_stats::word_stats_t *w = *it;
        if (ends_with(w->word, "'s"))
        {
            total++;
            word_stats::string s(w->word.begin(), w->word.end()-2);
            if (ws.words.find(&s) == ws.words.end())
                err_trailing_s++;
        }
    }
    return (0.0+err_trailing_s)/total;
}

// calculate probability of words with trailing 's
double get_probability_traling_s(const word_stats &ws, bool is_english)
{
    const word_stats::words_map_t words = ws.words;
    int trailing_s = 0;
    const word_stats::words_list_t &wl = is_english ? ws.words_list_english : ws.words_list_err;
    for (auto it=wl.begin(); it!=wl.end(); ++it)
    {
        const word_stats::word_stats_t *w = *it;
        if (ends_with(w->word, "'s"))
            trailing_s++;
    }
    return (0.0+trailing_s)/wl.size();
}

// calculate probability of words containing ' that's not part of trailing 's
double get_probability_apost_non_s(const word_stats &ws)
{
    const word_stats::words_map_t words = ws.words;
    int total = 0, trailing_s = 0;
    for (auto it=ws.words_list.begin(); it!=ws.words_list.end(); ++it)
    {
        const word_stats::word_stats_t *w = *it;
        string::size_type pos = w->word.find('\'');
        if (pos != string::npos)
        {
            total++;
            if (pos != w->word.size()-2 || w->word[w->word.size()-1] != 's')
                trailing_s++;
        }
    }
    //return (0.0+trailing_s)/total;
    return (0.0+trailing_s)/ws.words_list.size();
}

double get_ratio_len_gteq(const word_stats &ws, int len, bool is_english)
{
    const word_stats::words_map_t words = ws.words;
    size_t total_gt = 0;
    const word_stats::words_list_t &wl = is_english ? ws.words_list_english : ws.words_list_err;
    const vector<word_stats::words_list_t, my_alloc<word_stats::words_list_t> > &wsl = is_english ? ws.words_size_list_english : ws.words_size_list_err;
    for (unsigned i=len; i<wsl.size(); ++i)
        total_gt += wsl[i].size();
    return (0.0+total_gt)/wl.size();
}


double get_probability_len_gteq(const word_stats &ws, int len, bool is_english)
{
    const word_stats::words_map_t words = ws.words;
    size_t total = 0, total_gt = 0;
    const word_stats::words_list_t &wl = is_english ? ws.words_list_english : ws.words_list_err;
    const vector<word_stats::words_list_t, my_alloc<word_stats::words_list_t> > &wsl = is_english ? ws.words_size_list_english : ws.words_size_list_err;
    for (unsigned i=len; i<wsl.size(); ++i)
    {
        total_gt += wsl[i].size();
        total += ws.words_size_list[i].size();
    }
    return (0.0+total_gt)/total;
}

double get_probability_wrong_by_len(const word_stats &dict, const word_stats &test_data, unsigned len)
{
    size_t s1 = dict.words_size_list.size()>len ? dict.words_size_list[len].size() : 0;
    if (!s1 && test_data.words_size_list.size()<=len)
        return 1.0;
    return (test_data.words_size_list[len].size()) ? (test_data.words_size_list_err[len].size()/(test_data.words_size_list[len].size()+0.0)) : 1.0;
}

template<class T>
double get_probability_wrong_by_len(const T &dict_list, const T &test_data_list, const T &test_data_list_err, unsigned len)
{
    size_t s1 = dict_list.size()>len ? dict_list[len].size() : 0;
    if (!s1 && test_data_list.size()<=len)
        return 1.0;
    return (test_data_list[len].size()) ? (test_data_list_err[len].size()/(test_data_list[len].size()+0.0)) : 1.0;
}

struct xx_dict
{
    void build(const uint8_t *p, size_t len, uint32_t tab3[N][N][N])
    {
        if (len <= 2)
            return;
        uint8_t c0 = p[0], c1 = p[1];
        int *c = CHAR_TAB;
        uint32_t tmp_set[256];
        uint32_t *s = tmp_set;
        uint32_t x = (p[0] << 8) | p[1];
        for (size_t i=2; i<len; ++i)
        {
            x = ((x<<16)>>8) | p[i];
            *s++ = x;
        }
        s = unique(tmp_set, s);
        for (--s; s>=tmp_set; --s)
            tab3[c[(*s>>16)&0xff]][c[(*s>>8)&0xff]][c[(*s>>0)&0xff]] += 1;
    }
    void build(const char *p, size_t len)
    {
        if (len <= 2)
            return;
        if (len >= tabs.size())
            tabs.resize(len+1);
        tab &t = tabs[len];
        build((const uint8_t *)p, len, t.tab3);
        uint8_t new_len = 0, apos_count = 0;
        for (size_t i=0; i<len; ++i)
        {
            if (p[i]=='\'')
                apos_count++;
        }
        if (apos_count==0 || (apos_count==1 && p[len-1]=='s' && p[len-2]=='\''))
        {
            build((const uint8_t *)p, len, t.tab3_apos);
            build((const uint8_t *)p, apos_count ? len-2 : len, t.tab3_apos_s);
        }
    }
    void build(const word_stats::words_list_t &lst, bool use_root)
    {
        scoped_timer st("xx_dict::build");
        for (auto it=lst.begin(); it!=lst.end(); ++it)
            if (use_root)
                build((*it)->root->root.c_str(), (*it)->root->root.size());
            else
                build((*it)->word.c_str(), (*it)->word.size());
    }
    uint32_t test(const char *p, size_t len)
    {
        uint32_t ret = 1;
        if (len <= 2 || tabs.size()<=len)
            return ret;
        tab &t = tabs[len];
        int *c = CHAR_TAB;
        for (const char *e=p+len-2; ret && p<e; ++p)
            ret = t.tab3[c[p[0]]][c[p[1]]][c[p[2]]];
        return ret;
    }
    static uint32_t test(const char *p, size_t len, const uint32_t tab3[N][N][N])
    {
        uint32_t ret = 1;
        if (len <= 2)
            return ret;
        int *c = CHAR_TAB;
        for (const char *e=p+len-2; ret && p<e; ++p)
            ret = tab3[c[p[0]]][c[p[1]]][c[p[2]]];
        return ret;
    }
    static uint32_t test2(const char *p, size_t len, const uint32_t tab3[N][N][N])
    {
        uint32_t ret = 1;
        if (len <= 2)
            return ret;
        int *c = CHAR_TAB;
        for (const char *e = p + len - 2; ret && p < e; ++p)
            ret = tab3[p[0]-'a'+1][p[1]-'a'+1][p[2]-'a'+1];
        return ret;
    }
    struct tab 
    {
        tab()
        {
            memset(this, 0, sizeof(*this));
        }
        void add(const tab &rhs)
        {
            uint32_t *b1 = &tab3[0][0][0], *e1 = &tab3_apos_s[N-1][N-1][N-1]+1;
            const uint32_t *b2 = &rhs.tab3[0][0][0];
            while (b1 < e1)
            {
                *b1++ += *b2++;
            }
        }
        uint32_t tab3[N][N][N];
        uint32_t tab3_apos[N][N][N];
        uint32_t tab3_apos_s[N][N][N];
    };
    vector<tab, my_alloc<tab> > tabs; // for each length there is separate tab
};

struct solution
{
    enum hash_t
    {
        fnv1a, djb2, murmur2
    } h;
    xx_dict::tab tab6;
    bloom_filter bf;
    unsigned max_len;
    double train_factor, best_rate;
    unsigned bit_count;
    string save()
    {
        string buf;
        int size = 4+1+((26*26*26+7)/8)+bf.mem_size();
        buf.resize(size);
        uint8_t *mem = (uint8_t *)buf.data();
        *(uint32_t*)(mem) = (uint32_t)bf.sz;
        mem[4] = max_len;
        save_dict6(tab6.tab3_apos_s, mem+4+1);
        bf.save_to_buffer(mem+4+1+((26*26*26+7)/8));
        return buf;
    }
};

template<class T>
class obj_with_padding
{
public:
    obj_with_padding(const T &obj) : o(obj)
    {
        memset(pad, 0, sizeof(pad));
    }
    T o;
    uint32_t pad[4 * 1024];
}; 

struct x_state
{
    word_stats dict, test_data;
    bool loaded;
    xx_dict x_dict, x_test_data;
    xx_dict::tab rm_tab, rm_tab_e;

    static x_state* load(const char *dir)
    {
        string filename = dir;
        filename += ".x_state";
        FILE *fl = fopen(filename.c_str(), "rb");
        if (fl)
        {
            scoped_timer st("load:resurrect");

            fseek(fl, 0, SEEK_END);
            uint64_t addr_size[2];
            fseek(fl, -(int)sizeof(addr_size), SEEK_END);
            size_t sz = ftell(fl);
            fread(addr_size, 1, sizeof(addr_size), fl);
            if (addr_size[1] == sz)
            {
                void *addr = ::VirtualAlloc((void*)addr_size[0], (size_t)addr_size[1] + 16 * 1024, MEM_COMMIT | MEM_RESERVE, PAGE_READWRITE);
                memset((char*)addr + addr_size[1], 0, 16 * 1024);
                fseek(fl, 0, SEEK_SET);
                size_t read_size = fread(addr, 1, sz, fl);
                assert(read_size == sz);
                fclose(fl);
                assert((void*)addr_size[0] == addr);
                x_state *ret = (x_state*)addr;
                ret->loaded = true;
                ret->addr = addr;
                ret->sz = (size_t)addr_size[1];
                return ret;
            }
            fclose(fl);
        }
        x_state *ret = new x_state;
        load_words("words.txt", ret->dict);
        load_samples(dir, ret->test_data);
        calculate_xx_dict(ret, false);
        //x_state::save(ret, dir);
        return ret;
    }
    static void save(x_state *s, const char *dir)
    {
        scoped_timer st("save");

        string filename = dir;
        filename += ".x_state";
        pair<x_state*, size_t> ret = create_copy(*s);
        FILE *fl = fopen(filename.c_str(), "wb");
        size_t write_size = fwrite(ret.first, 1, ret.second, fl);
        uint64_t addr_size[2] = {(uint64_t)ret.first, (uint64_t)ret.second};
        fwrite((void*)addr_size, 1, sizeof(addr_size), fl);
        fclose(fl);
        delete_copy(ret.first, ret.second);
    }
    static void unload(x_state *s)
    {
        if (!s)
            return;
        if (!s->addr)
            delete s;
        else
            delete_copy(s, s->sz, false);
    }

private:
    x_state() : loaded(false), addr(NULL), sz(0){}
    ~x_state(){}
    friend class my_alloc<x_state>;
    friend class obj_with_padding<x_state>;

    void *addr;
    size_t sz;
};


void calculate_xx_dict(x_state *st, bool use_root)
{
    st->x_dict.tabs.clear();
    st->x_test_data.tabs.clear();
    st->x_dict.build(st->dict.words_list_english, use_root);
    st->x_test_data.build(st->test_data.words_list_err, use_root);
}

void calculate_dict(x_state *st, unsigned max_len, int max_loss = 1000)
{
    xx_dict::tab &t1 = st->rm_tab, t2;
    for (unsigned i=0; i<max_len; ++i)
    {
        if (i < st->x_dict.tabs.size())
            t1.add(st->x_dict.tabs[i]);
        if (i < st->x_test_data.tabs.size())
            t2.add(st->x_test_data.tabs[i]);
    }
    multimap<uint32_t, uint32_t> m1, m2, m1_apos, m2_apos, m1_apos_s, m2_apos_s;
    for (int i=0; i<N; ++i)
    {
        for (int j=0; j<N; ++j)
        {
            for (int k=0; k<N; ++k)
            {
                m1.insert(make_pair(t1.tab3[i][j][k], (i<<16) | (j<<8) | k));
                m2.insert(make_pair(t2.tab3[i][j][k], (i<<16) | (j<<8) | k));
                m1_apos.insert(make_pair(t1.tab3_apos[i][j][k], (i<<16) | (j<<8) | k));
                m2_apos.insert(make_pair(t2.tab3_apos[i][j][k], (i<<16) | (j<<8) | k));
                m1_apos_s.insert(make_pair(t1.tab3_apos_s[i][j][k], (i<<16) | (j<<8) | k));
                m2_apos_s.insert(make_pair(t2.tab3_apos_s[i][j][k], (i<<16) | (j<<8) | k));
            }
        }
    }
    struct s1
    {
        int i, j, k;
        int count1, count2;
    };
    map<double, s1> x, x_apos, x_apos_s;
    for (int i=0; i<3; ++i)
    {
        multimap<uint32_t, uint32_t> &mm = i==0 ? m1 : (i==1 ? m1_apos : m1_apos_s);
        map<double, s1> &xx = i==0 ? x : (i==1 ? x_apos : x_apos_s);
        for (auto it=mm.begin(); it!=mm.end(); ++it)
        {
            int i = (it->second>>16)&0xff, j = (it->second>>8)&0xff, k = (it->second>>0)&0xff;
            if (it->first && (int)it->first<max_loss)
            {
                s1 s;
                s.i = i, s.j = j, s.k = k;
                s.count1 = it->first, s.count2 = (i==0 ? t2.tab3 : (i==1 ? t2.tab3_apos : t2.tab3_apos_s))[i][j][k];
                xx[(0.0+it->first)/s.count2] = s;
            }
            //printf("%c%c%c => %4d  err: %4d\n", 96+i, 96+j, 96+k, it->first, t2.tab3[i][j][k]);
        }
    }
    xx_dict::tab &rm_tab = st->rm_tab_e;
    int count = 0, count_apos = 0, count_apos_s = 0;
    int count2 = 0, count2_apos = 0, count2_apos_s = 0;
    for (int i=0; i<3; ++i)
    {
        map<double, s1> &xx = i==0 ? x : (i==1 ? x_apos : x_apos_s);
        int &cn = i==0 ? count : (i==1 ? count_apos : count_apos_s);
        int &cn2 = i==0 ? count2 : (i==1 ? count2_apos : count2_apos_s);
        for (auto it=xx.begin(); /*cn<max_loss &&*/ it!=xx.end(); ++it)
        {
            if (it->first > 0.4)
                break;
            cn += it->second.count1;
            cn2 += it->second.count2;
            (i==0 ? rm_tab.tab3 : (i==1 ? rm_tab.tab3_apos : rm_tab.tab3_apos_s))[it->second.i][it->second.j][it->second.k] = 1;
            //printf("%c%c%c => %4d  err: %4d\n", 96+it->second.i, 96+it->second.j, 96+it->second.k, it->second.count1, it->second.count2);
        }
        //printf("cn:%d cn2:%d\n", cn, cn2);
    }
}

void calculate_dict2(x_state *st, unsigned max_len, xx_dict::tab &t1)
{
    for (unsigned i=0; i<max_len; ++i)
    {
        if (i < st->x_dict.tabs.size())
            t1.add(st->x_dict.tabs[i]);
    }
}

template<class T>
bool test(x_state *st, const T &word, unsigned max_len)
{
    unsigned len = word.size();
    if (len >= max_len)
        return false;

    uint8_t new_len = 0, apos_count = 0;
    for (size_t i=0; i<len; ++i)
    {
        if (word[i]=='\'')
            apos_count++;
    }
    if (!(apos_count==0 || (apos_count==1 && word[len-1]=='s' && word[len-2]=='\'')))
        return false;
    if (apos_count>0)
        len -= 2;
    if (!st->x_dict.test(word.c_str(), len, st->rm_tab.tab3_apos_s))
        return false;
    return true;
}

template<class T>
bool test2(const xx_dict::tab &tab, const T &word, const T &word_n, unsigned max_len)
{
    if (word_n.empty() || word.size() >= max_len)
        return false;
    if (!xx_dict::test2(word_n.c_str(), word_n.size(), tab.tab3_apos_s))
        return false;
    return true;
}

template<class T>
bool test(x_state *st, const T &word, bloom_filter &bf)
{
    return bf.test(word.c_str(), word.size());
}

bool test2_fnv1a(word_stats::root_stats_t *root, bloom_filter &bf) { return bf.test(root->hashes[0]); }
bool test2_djb2(word_stats::root_stats_t *root, bloom_filter &bf) { return bf.test(root->hashes[1]); }
bool test2_murmur2(word_stats::root_stats_t *root, bloom_filter &bf) { return bf.test(root->hashes[2]); }

bool test22_fnv1a(word_stats::root_stats_t *root, bloom_filter &bf) { return bf.test2(root->hashes[0]); }
bool test22_djb2(word_stats::root_stats_t *root, bloom_filter &bf) { return bf.test2(root->hashes[1]); }
bool test22_murmur2(word_stats::root_stats_t *root, bloom_filter &bf) { return bf.test2(root->hashes[2]); }

double get_rate_at_train_factor2(const bloom_filter &bf, double train_factor, const x_state *st, const solution &s)
{
    bloom_filter traned_filter = bf;
    traned_filter.train(train_factor);
    int countX = 0;
    bool(*test2_f)(word_stats::root_stats_t *, bloom_filter &) = NULL;
    assert(traned_filter.hashes == 1);
    if (traned_filter.hh[0] == fnv1a)
        test2_f = test22_fnv1a;
    else if (traned_filter.hh[0] == djb2)
        test2_f = test22_djb2;
    else
        test2_f = test22_murmur2;
    for (auto it : st->test_data.words_list)
    {
        bool is_english = test2(s.tab6, it->word, it->word_n, s.max_len) && test2_f(it->root, traned_filter);
        if (is_english == it->is_english)
            countX++;
    }
    return 100.0*countX/st->test_data.words_list.size();
}

void get_best_train_factor2(const bloom_filter &bf, const x_state *st, solution &sol, double &best_factor, double &best_rate)
{
    //scoped_timer xxx("get_best_train_factor2");
    best_rate = best_factor = 0;
    double s = 0.5;
#pragma omp parallel for
    for (int i=0; i<10; ++i)
    {
        double rate = get_rate_at_train_factor2(bf, s+0.3*i, st, sol);
        if (rate > best_rate)
        {
            best_rate = rate;
            best_factor = s+0.3*i;
        }
    }
    s = best_factor-0.35;
#pragma omp parallel for
    for (int i=0; i<8; ++i)
    {
        double rate = get_rate_at_train_factor2(bf, s+0.1*i, st, sol);
        if (rate > best_rate)
        {
            best_rate = rate;
            best_factor = s+0.1*i;
        }
    }
    s = best_factor-0.1;
#pragma omp parallel for
    for (int i=0; i<8; ++i)
    {
        double rate = get_rate_at_train_factor2(bf, s+0.03*i, st, sol);
        if (rate > best_rate)
        {
            best_rate = rate;
            best_factor = s+0.03*i;
        }
    }
    s = best_factor-0.03;
#pragma omp parallel for
    for (int i=0; i<12; ++i)
    {
        double rate = get_rate_at_train_factor2(bf, s+0.005*i, st, sol);
        if (rate > best_rate)
        {
            best_rate = rate;
            best_factor = s+0.005*i;
        }
    }
}

double verify_solution(x_state *st, solution &sol)
{
#define SAVE_DATA 0
    vector<string> xx_res;
    int ok_count = 0, match_count = 0;
    for (auto it=st->test_data.words_list.begin(); it!=st->test_data.words_list.end(); ++it)
    {
        bool test_result = test2(sol.tab6, (*it)->word, (*it)->word_n, sol.max_len) && test(st, (*it)->root->root, sol.bf);
        if (SAVE_DATA)
        {
        char buf[256];
        sprintf(buf, "\"%.*s\" => %d (%s)", (int)(*it)->word.size(), (*it)->word.data(), test_result ? 1 : 0, test_result == (*it)->is_english ? "OK" : "ERR");
        xx_res.push_back(buf);
        }
        if (test_result)
            ok_count++;
        if (test_result == (*it)->is_english)
            match_count++;
    }
    if (SAVE_DATA)
    {
    sort(xx_res.begin(), xx_res.end());
    FILE *test_fl = fopen("test_cpp", "wb");
    for (size_t i=0; i<xx_res.size(); ++i)
        fprintf(test_fl, "%s\n", xx_res[i].c_str());
    fclose(test_fl);
    }
    printf("                      ACTUAL RATE: %.14f%%\n\n", 100.0*match_count/st->test_data.words_list.size());
    printf("tested: %zd, returned ok: %d\n", st->test_data.words_list.size(), ok_count);

    return 100.0*match_count/st->test_data.words_list.size();
}

void run_test_bloom2(x_state *st, solution &sol, int bits = 524081)
{
    bloom_filter &bfX = sol.bf;
    word_stats::roots_map_t roots;
    for (auto it : st->dict.words)
    {
        if (test2(sol.tab6, it.second->word, it.second->word_n, sol.max_len))
            roots[&it.second->root->root] = it.second->root;
    }
    bfX.init_sz(roots.size(), 64*1024);

    bool (*test2_f)(word_stats::root_stats_t *, bloom_filter &) = NULL;

    if (sol.h == solution::fnv1a)
    {
        bfX.hh[0] = fnv1a;
        test2_f = test2_fnv1a;
    }
    else if (sol.h == solution::djb2)
    {
        bfX.hh[0] = djb2;
        test2_f = test2_djb2;
    }
    else if (sol.h == solution::murmur2)
    {
        bfX.hh[0] = murmur2;
        test2_f = test2_murmur2;
    }
    // assume only one has will be used.
    assert(bfX.hashes==1);
    bfX.sz = bits;
    //if (sol.h == solution::djb2)
    //    bfX.sz += 350;
    for (auto it : st->dict.words_list)
    {
        if (test2(sol.tab6, it->word, it->word_n, sol.max_len))
            bfX.add(it->root->root.c_str(), it->root->root.size());
    }
    for (auto it : st->test_data.words_list_err)
    {
        if (test2(sol.tab6, it->word, it->word_n, sol.max_len))
            test2_f(it->root, bfX);
    }
    get_best_train_factor2(bfX, st, sol, sol.train_factor, sol.best_rate);
}

void my_main2(x_state *st);
int main(int argc, char **argv)
{
    if (argc<=1)
    {
        printf("hola_challenge <dir> with downloaded samples. words.txt is expected in current dir\n");
        return 1;
    }
    scoped_timer stm("main");
    const char *dir = argc>1 ? argv[1] : "xx_test_data";
    init_char_tab();
    x_state *st = x_state::load(dir);
    my_main2(st);
    //if (!st->loaded)
    //    x_state::save(st, dir);
    x_state::unload(st);
}

string read_file(const char *name)
{
    FILE *fl = fopen(name, "rb");
    fseek(fl, 0, SEEK_END);
    size_t sz = ftell(fl);
    string out;
    out.resize(sz);
    fseek(fl, 0, SEEK_SET);
    fread(&out[0], 1, out.size(), fl);
    fclose(fl);
    return out;
}

void save_file(const char *name, const string &data)
{
    FILE *fl = fopen(name, "wb");
    fwrite(data.data(), 1, data.size(), fl);
    fclose(fl);
}

string get_solution_fnv1a_js()
{
    return read_file("solution_fnv1a.js");
}

string get_solution_djb2_js()
{
    return read_file("solution_djb2.js");
}

string to_gzip(const string &data)
{
    FILE *fl = fopen(".$$", "wb");
    fwrite(data.data(), 1, data.size(), fl);
    fclose(fl);
    std::system("gzip -9 -n -q -f .$$");
    string out = read_file(".$$.gz");
    unlink(".$$.gz");
    return out;
}

void my_main2(x_state *st)
{
    int solution_js_size = read_file("solution.js").size();

    double best_rate = 0;
    int best_max_len = 0;
    int best_hash = 0;
    for (int i=16; i<=19; ++i)
    {
        solution sol;
        sol.max_len = i;
        calculate_dict2(st, sol.max_len, sol.tab6);
        run_test_bloom2(st, sol);
        if (sol.best_rate > best_rate)
        {
            best_rate = sol.best_rate;
            best_max_len = i;
        }
    }
    /*for (int j=1; j<3; ++j)
    {
        solution sol;
        sol.max_len = best_max_len;
        sol.h = (solution::hash_t)j;
        calculate_dict2(st, sol.max_len, sol.tab6);
        run_test_bloom2(st, sol);
        if (sol.best_rate > best_rate)
        {
            best_rate = sol.best_rate;
            best_hash = j;
        }
    }*/
    assert(best_hash==0);  // fnv1a

    const char *hs[] = { "fnv1a  ", "djb2   ", "murmur2" };
    solution best;
    best.best_rate = 0;
    for (int i=0; i<35; i++)
    {
        //scoped_timer st1("estimate...");
        solution sol;
        sol.bit_count =  524933-i; //524081-i; // 525433
        sol.max_len = best_max_len;
        sol.h = (solution::hash_t)best_hash;
        calculate_dict2(st, sol.max_len, sol.tab6);
        run_test_bloom2(st, sol, sol.bit_count);
        sol.bf.train(sol.train_factor);
        //verify_solution(st, sol);
        string s0 = get_solution_fnv1a_js(), s1 = sol.save(), s;
        s.resize(4+s0.size()+s1.size());
        uint8_t *mem = (uint8_t*)s.data();
        *(uint32_t*)mem = (uint32_t)s0.size();
        memcpy(mem+4, s0.data(), s0.size());
        memcpy(mem+4+s0.size(), s1.data(), s1.size());

        //FILE *fl = fopen("data", "wb");
        //fwrite(mem, 1, s.size(), fl);
        //fclose(fl);
        int SZ = 64*1024-to_gzip(s).size()-solution_js_size;
        if (SZ >= 0 && sol.best_rate>best.best_rate)
            best = sol;
        printf("%d:%s%4d             BEST RATE: %.14f%% (train factor:%f  sz:%d)\n", best_max_len, hs[best_hash], -i, sol.best_rate, sol.train_factor, SZ);
    }
    verify_solution(st, best);
    string s0 = get_solution_fnv1a_js(), s1 = best.save(), s;
    s.resize(4+s0.size()+s1.size());
    uint8_t *mem = (uint8_t*)s.data();
    *(uint32_t*)mem = (uint32_t)s0.size();
    memcpy(mem+4, s0.data(), s0.size());
    memcpy(mem+4+s0.size(), s1.data(), s1.size());
    string gzip = to_gzip(s);
    save_file("data.gz", gzip);
    int SZ = 64 * 1024 - gzip.size() - solution_js_size;
    printf("selected solution:");
    printf("%d:%s%d             BEST RATE: %.14f%% (train factor:%f  sz:%d)\n", best_max_len, hs[best_hash], best.bit_count, best.best_rate, best.train_factor, SZ);
}

