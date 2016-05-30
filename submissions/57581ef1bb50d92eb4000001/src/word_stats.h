#pragma once
#include <map>
#include <vector>
#include <list>
#include <string>
#include "alloc.h"

using namespace std;


struct word_stats
{
    word_stats()
    {
    }

    word_stats(const word_stats &rhs);

    struct word_stats_t;
    struct root_stats_t;
    typedef std::basic_string<char, std::char_traits<char>, my_alloc<char> > string;
    struct less_ptr
    {
        bool operator()(const string *lhs, const string *rhs) const
        {
            return *lhs < *rhs;
        }
    };
    typedef map<const string*, word_stats_t*, less_ptr, my_alloc<pair<const string*, word_stats_t*> > > words_map_t;
    typedef map<const string*, root_stats_t*, less_ptr, my_alloc<pair<const string*, word_stats_t*> > > roots_map_t;
    typedef vector<const word_stats_t *, my_alloc<const word_stats_t *> > words_list_t;
    //typedef pair<words_list_t, words_list_t> 
    struct root_stats_t
    {
        string root;
        uint32_t hashes[3];
        map<const string*, word_stats_t*, less_ptr, my_alloc<pair<const string*, word_stats_t*> > > words_map;
        vector<const string*, my_alloc<const string *> > words;
        bool is_english;
    };
    struct word_stats_t
    {
        string word, word_n;
        root_stats_t *root;
        bool is_english;
        int count;
    };

    void add_word(const char *s, const char *s_end, bool is_english = true);
    void add_word(const char *s, bool is_english = true)
    {
        add_word(s, s+strlen(s), is_english);
    }

    words_map_t words, words_n;
    roots_map_t roots;
    words_list_t words_list, words_list_english, words_list_err;
    vector<words_list_t, my_alloc<words_list_t> > words_size_list, words_size_list_english, words_size_list_err;
    vector<words_list_t, my_alloc<words_list_t> > roots_size_list, roots_size_list_english, roots_size_list_err;
    list<word_stats_t, my_alloc<words_list_t> > wlst;
    list<root_stats_t, my_alloc<words_list_t> > rlst;

private:
    word_stats_t& get_word_stats(const string &word);
};
