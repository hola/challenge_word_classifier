// {{{ by shik
#include <bits/stdc++.h>
#include <unistd.h>
#define SZ(x) ((int)(x).size())
#define ALL(x) begin(x),end(x)
#define REP(i,n) for ( int i=0; i<int(n); i++ )
#define REP1(i,a,b) for ( int i=(a); i<=int(b); i++ )
#define FOR(it,c) for ( auto it=(c).begin(); it!=(c).end(); it++ )
#define MP make_pair
#define PB push_back
using namespace std;
typedef long long LL;
typedef pair<int,int> PII;
typedef vector<int> VI;

#ifdef SHIK
template<typename T>
void _dump( const char* s, T&& head ) { cerr<<s<<"="<<head<<endl; }

template<typename T, typename... Args>
void _dump( const char* s, T&& head, Args&&... tail ) {
    int c=0;
    while ( *s!=',' || c!=0 ) {
        if ( *s=='(' || *s=='[' || *s=='{' ) c++;
        if ( *s==')' || *s==']' || *s=='}' ) c--;
        cerr<<*s++;
    }
    cerr<<"="<<head<<", ";
    _dump(s+1,tail...);
}

#define dump(...) do { \
    fprintf(stderr, "%s:%d - ", __PRETTY_FUNCTION__, __LINE__); \
    _dump(#__VA_ARGS__, __VA_ARGS__); \
} while (0)

template<typename Iter>
ostream& _out( ostream &s, Iter b, Iter e ) {
    s<<"[";
    for ( auto it=b; it!=e; it++ ) s<<(it==b?"":" ")<<*it;
    s<<"]";
    return s;
}

template<typename A, typename B>
ostream& operator <<( ostream &s, const pair<A,B> &p ) { return s<<"("<<p.first<<","<<p.second<<")"; }
template<typename T>
ostream& operator <<( ostream &s, const vector<T> &c ) { return _out(s,ALL(c)); }
template<typename T, size_t N>
ostream& operator <<( ostream &s, const array<T,N> &c ) { return _out(s,ALL(c)); }
template<typename T>
ostream& operator <<( ostream &s, const set<T> &c ) { return _out(s,ALL(c)); }
template<typename A, typename B>
ostream& operator <<( ostream &s, const map<A,B> &c ) { return _out(s,ALL(c)); }
#else
#define dump(...)
#endif

template<typename T>
void _R( T &x ) { cin>>x; }
void _R( int &x ) { scanf("%d",&x); }
void _R( long long &x ) { scanf("%" PRId64,&x); }
void _R( double &x ) { scanf("%lf",&x); }
void _R( char &x ) { scanf(" %c",&x); }
void _R( char *x ) { scanf("%s",x); }

void R() {}
template<typename T, typename... U>
void R( T& head, U&... tail ) {
    _R(head);
    R(tail...);
}

template<typename T>
void _W( const T &x ) { cout<<x; }
void _W( const int &x ) { printf("%d",x); }
template<typename T>
void _W( const vector<T> &x ) {
    for ( auto i=x.cbegin(); i!=x.cend(); i++ ) {
        if ( i!=x.cbegin() ) putchar(' ');
        _W(*i);
    }
}

void W() {}
template<typename T, typename... U>
void W( const T& head, const U&... tail ) {
    _W(head);
    putchar(sizeof...(tail)?' ':'\n');
    W(tail...);
}

#ifdef SHIK
#define FILEIO(...)
#else
#define FILEIO(name) do {\
    freopen(name ".in","r",stdin); \
    freopen(name ".out","w",stdout); \
} while (0)
#endif

// }}}

struct Test {
    string s;
    bool label;
};

const string DICT_PATH="./words.txt";
const int BUF_LEN=1024;
const int MAX_GOOD_LEN=13;
const int BLOOM_SIZE=(1<<19)+(4170<<3);
FILE *fout;

inline uint32_t shik_hash( const char *s ) {
    uint32_t h=0;
    for ( int i=0; i<8 && s[i]; i++ ) h=(h*137LL+s[i])%BLOOM_SIZE;
    return h;
}

inline uint32_t shik_hash( const string &s ) {
    return shik_hash(s.data());
}

void init() {
    fout=fopen("data","wb");
    assert(fout);
}

void write_out( int len, void *ptr, bool with_len=false ) {
    if ( with_len ) fwrite(&len,1,sizeof(len),fout);
    fwrite(ptr,1,len,fout);
}

#define set_dict(nd) do { \
    nd.swap(dict); \
    sort(ALL(dict)); \
    dict.erase(unique(ALL(dict)),dict.end()); \
    dump(SZ(dict)); \
} while ( 0 )

vector<string> dict;
void read_dict() {
    ifstream fin(DICT_PATH);
    assert(fin.good());
    string s;
    while ( fin>>s ) {
        for ( auto &c:s ) c=tolower(c);
        dict.PB(s);
    }
    set_dict(dict);
}

vector<Test> tests;
void read_tests() {
    const int T=5000000;
    char buf[BUF_LEN];
    tests.reserve(T);
    REP1(t,1,T) {
        sprintf(buf,"testcase/%d",t);
        FILE *fp=fopen(buf,"r");
        assert(fp);
        REP(i,101) {
            auto ret=fgets(buf,sizeof(buf),fp);
            // assert(ret!=NULL);
            if ( i==0 ) continue;
            // assert(buf[0]==' '&&buf[2]=='"');
            auto ed=strchr(buf+3,'"');
            // assert(ed!=NULL);
            *ed='\0';
            // assert(*(ed+1)==':');
            tests.PB(Test{buf+3,*(ed+3)=='t'});
        }
        fclose(fp);
    }
    dump(SZ(tests));
}

inline bool fast_check( const string &s ) {
    const static regex re("'|.{14}|[qjx]{2}|[qjxzwkvfgbdm]{3}|[^aeiouy]{5}");
    return !regex_search(s,re);
}

void drop_regex() {
    vector<string> nd;
    for ( auto &s:dict ) if ( fast_check(s) ) nd.PB(s);
    set_dict(nd);
}

inline string stem( const string &s ) {
    const static regex re("(...+?)(ing)?(ed)?(ly)?s?('s)?$");
    return regex_replace(s,re,"$1");
}

void stem() {
    vector<string> nd;
    for ( auto &s:dict ) nd.PB(stem(s));
    set_dict(nd);
}

#include <omp.h>
void make_bloom() {
    static uint8_t bloom[BLOOM_SIZE/8];
    auto in=[&]( int x ) {
        return (bloom[x>>3]>>(x&7))&1;
    };
    for ( auto &s:dict ) {
        auto h=shik_hash(s.c_str());
        bloom[h>>3]|=1<<(h&7);
    }
    static int c[BLOOM_SIZE][2],_c[8][BLOOM_SIZE][2];
    int nt=SZ(tests);
#pragma omp parallel for num_threads(8)
    for ( int i=0; i<nt; i++ ) {
        auto &t=tests[i];
        string s=stem(t.s);
        if ( fast_check(s) ) _c[omp_get_thread_num()][shik_hash(s)][t.label]++;
    }
    REP(i,8) REP(j,BLOOM_SIZE) REP(k,2) c[j][k]+=_c[i][j][k];
    int cnt=0;
    REP(i,BLOOM_SIZE) if ( in(i) && c[i][0]>=c[i][1] ) {
        cnt++;
        bloom[i>>3]&=~(1<<(i&7));
    }
    dump(cnt,BLOOM_SIZE);
    int one=0;
    REP(i,BLOOM_SIZE/8) one+=__builtin_popcount(bloom[i]);
    dump(one,(double)one/BLOOM_SIZE);
    write_out(sizeof(bloom),bloom);
}

void make_gz() {
    fclose(fout);
    vector<Test>().swap(tests);
    auto code=system("zopfli data");
    assert(code==0);
    system("ls -l data data.gz");
}

int main() {
    init();
    read_dict();
    read_tests();
    stem();
    drop_regex();
    make_bloom();
    make_gz();
    return 0;
}
