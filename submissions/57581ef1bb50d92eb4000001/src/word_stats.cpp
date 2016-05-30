#include "word_stats.h"
#include "scoped_timer.h"
#include <iostream>
#include <unordered_map>

int stem_int(char *str, size_t len);
static void to_stem(word_stats::string &str)
{
    /*
    cat words_sorted.txt  | grep -P "^im" | wc -l
    cat words_sorted.txt  | grep -P "^un" | wc -l
    cat words_sorted.txt  | grep -P "^non" | wc -l
    cat words_sorted.txt  | grep -P "^pre" | wc -l
    cat words_sorted.txt  | grep -P "^over" | wc -l
    cat words_sorted.txt  | grep -P "^anti" | wc -l
    cat words_sorted.txt  | grep -P "^auto" | wc -l
    cat words_sorted.txt  | grep -P "^de" | wc -l
    cat words_sorted.txt  | grep -P "^dis" | wc -l
    cat words_sorted.txt  | grep -P "^down" | wc -l
    cat words_sorted.txt  | grep -P "^extra" | wc -l
    cat words_sorted.txt  | grep -P "^hyper" | wc -l
    cat words_sorted.txt  | grep -P "^semi" | wc -l
    cat words_sorted.txt  | grep -P "^under" | wc -l
    cat words_sorted.txt  | grep -P "^super" | wc -l
    cat words_sorted.txt  | grep -P "^ultra" | wc -l

    BASE ACTUAL RATE: 80.459%
    im          => 80.439%
    un          =>      80.594%
    non         =>      80.502%
    pre         => 80.453%
    over        =>      80.496%
    anti        =>      80.461%
    auto        => 80.446%
    de          => 80.357%
    dis         => 80.412%
    down        => 80.459%
    extra       =>      80.463%
    hyper       => 80.457%
    semi        =>      80.473%
    under       =>      80.474%
    super       =>      80.466%
    ultra       =>      80.464%

    TOTAL       =>      80.699%
    */


    const char *prefixes[] = {"un", "non", "over", "anti", "extra", "semi", "super", "ultra"};
    for (auto prefix : prefixes)
    {
        size_t len = strlen(prefix);
        if (str.size()>len && 0==memcmp(str.c_str(), prefix, len))
        {
            str.erase(0, len);
            break;
        }
    }

    int len = stem_int((char*)str.data(), str.size());
    str.resize(len);
}

uint32_t fnv1a(const char *str, size_t len);
uint32_t djb2(const char *str, size_t len);
uint32_t murmur2(const char *str, size_t len);

word_stats::word_stats_t& word_stats::get_word_stats(const string &word)
{
    auto it = words.find(&word);
    if (it == words.end())
    {
        string word_n;
        uint8_t new_len = 0, apos_count = 0;
        for (size_t i=0; i<word.size(); ++i)
        {
            if (word[i] == '\'')
                apos_count++;
        }
        if (apos_count==0 || (apos_count==1 && word[word.size()-1]=='s' && word[word.size()-2]=='\''))
            word_n.assign(word.c_str(), word.size()-(apos_count?2:0));
        string root = word_n;
        to_stem(root);
        auto it2 = roots.find(&root);
        if (it2 == roots.end())
        {
            rlst.push_back(root_stats_t());
            root_stats_t &rs = rlst.back();
            rs.root = root;
            rs.hashes[0] = fnv1a(root.data(), root.size());
            rs.hashes[1] = djb2(root.data(), root.size());
            rs.hashes[2] = murmur2(root.data(), root.size());
            rs.is_english = false;
            auto it3 = roots.insert(make_pair(&rs.root, &rs));
            it2 = it3.first;
        }

        wlst.push_back(word_stats_t());
        word_stats_t &ws = wlst.back();
        ws.word = word;
        ws.word_n = word_n;
        ws.root = it2->second;
        ws.is_english = false;
        ws.count = 0;

        words_n.insert(make_pair(&ws.word_n, &ws));
        auto it4 = words.insert(make_pair(&ws.word, &ws));
        it = it4.first;
    }
    return *it->second;
}

void word_stats::add_word(const char *s, const char *s_end, bool is_english)
{
    word_stats_t &ws = get_word_stats(string(s, s_end));
    root_stats_t &rs = *ws.root;
    words_list_t &wl = is_english ? words_list_english : words_list_err;
    vector<words_list_t, my_alloc<words_list_t> > &wsl = is_english ? words_size_list_english : words_size_list_err;
    vector<words_list_t, my_alloc<words_list_t> > &rsl = is_english ? roots_size_list_english : roots_size_list_err;
    ws.count++;
    if (is_english)
    {
        ws.is_english = is_english;
        rs.is_english = is_english;
    }
    rs.words.push_back(&ws.word);
    rs.words_map[&ws.word] = &ws;
    words_list.push_back(&ws);
    wl.push_back(&ws);
    //const string *key = &it->first;
    //words_list.push_back(key);
    size_t sz  = ws.word.size();
    if (words_size_list.size() <= sz)
    {
        words_size_list.resize(sz+1);
        words_size_list_english.resize(sz+1);
        words_size_list_err.resize(sz+1);
        roots_size_list.resize(sz+1);
        roots_size_list_english.resize(sz+1);
        roots_size_list_err.resize(sz+1);
    }
    words_size_list[sz].push_back(&ws);
    wsl[sz].push_back(&ws);
    roots_size_list[sz].push_back(&ws);
    rsl[sz].push_back(&ws);
}

template<class T, class VM>
static void copy_vector(const T &from, T &to, VM &value_map)
{
    to.reserve(from.size());
    for (auto it=from.begin(); it!=from.end(); ++it)
        to.push_back(value_map[*it]);
}

template<class T, class VM>
static void copy_vvector(const T &from, T &to, VM &value_map)
{
    to.resize(from.size());
    auto x = to.begin();
    for (auto it=from.begin(); it!=from.end(); ++it, ++x)
    {
        x->reserve(it->size());
        for (auto it2=it->begin(); it2!=it->end(); ++it2)
            x->push_back(value_map[*it2]);
    }
}

template<class T, class KM, class VM>
static void copy_map(const T &from, T &to, KM &key_map, VM &value_map)
{
    for (auto it=from.begin(); it!=from.end(); ++it)
        to[key_map[it->first]] = value_map[it->second];
}

word_stats::word_stats(const word_stats &rhs)
{
    scoped_timer st("word_stats copy");
    unordered_map<const word_stats_t*, word_stats_t*> w;
    unordered_map<const root_stats_t*, root_stats_t*> r;
    unordered_map<const string*, const string*> ws, ws_n;
    unordered_map<const string*, const string*> rs;
    w.reserve(1100000);
    r.reserve(1100000);
    ws.reserve(1100000);
    ws_n.reserve(1100000);
    rs.reserve(1100000);

    for (auto it=rhs.wlst.begin(); it!=rhs.wlst.end(); ++it)
    {
        wlst.push_back(*it);
        w[&*it] = &wlst.back();
        ws[&it->word] = &wlst.back().word;
        ws_n[&it->word_n] = &wlst.back().word_n;
    }
    for (auto it=rhs.rlst.begin(); it!=rhs.rlst.end(); ++it)
    {
        rlst.push_back(root_stats_t());
        root_stats_t &p = rlst.back();
        p.is_english = it->is_english;
        p.root = it->root;
        p.hashes[0] = it->hashes[0];
        p.hashes[1] = it->hashes[1];
        p.hashes[2] = it->hashes[2];
        copy_vector(it->words, p.words, ws);
        copy_map(it->words_map, p.words_map, ws, w);
        r[&*it] = &rlst.back();
        rs[&it->root] = &rlst.back().root;
    }
    auto it2 = wlst.begin();
    for (auto it=rhs.wlst.begin(); it!=rhs.wlst.end(); ++it, ++it2)
        it2->root = r[it->root];
    copy_map(rhs.words, words, ws, w);
    copy_map(rhs.words_n, words_n, ws_n, w);
    copy_map(rhs.roots, roots, rs, r);
    
    copy_vector(rhs.words_list, words_list, w);
    copy_vector(rhs.words_list_english, words_list_english, w);
    copy_vector(rhs.words_list_err, words_list_err, w);

    copy_vvector(rhs.words_size_list, words_size_list, w);
    copy_vvector(rhs.words_size_list_english, words_size_list_english, w);
    copy_vvector(rhs.words_size_list_err, words_size_list_err, w);
    
    copy_vvector(rhs.roots_size_list, roots_size_list, w);
    copy_vvector(rhs.roots_size_list_english, roots_size_list_english, w);
    copy_vvector(rhs.roots_size_list_err, roots_size_list_err, w);

    //printf("w.size:%d, r.size():%d, ws.size:%d, rs.size:%d\n", w.size(), r.size(), ws.size(), rs.size());
}
