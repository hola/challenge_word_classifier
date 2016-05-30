#include "types.h"
#include "solver.h"

char* suffixes[NSUFFIXES]={"'s","s","ed","ing","able","ly","nes","er","ation"};
char* prefixes[NPREFIXES]={"over","non","under","un","pre","anti","inter","out","semi","sub","super"};

int prefix3[27*27*27];
int suffix3[27*27*27];
int suffix4[27*27*27*27];

Vocab _v;
Vocab* v;
Bloom _bloom;
Bloom* bloom;

int sanity(char* a)
{
int i,L,apos,con,vow;
apos=con=vow=0;
L=strlen(a);
if(L<2 || L>16)return 0;
for(i=0;i<L;++i)
 {
 if(a[i]=='\'')
  {if(++apos>1)return 0;}
 else
  {
  if((CONSONANTS>>(a[i]-'a'))&1){if(++con>6)return 0;vow=0;}
  else {con=0;if(++vow>4)return 0;}
  }
 }
if(apos && (a[L-2]!='\'' || a[L-1]!='s'))return 0;
return 1;
}

int _suffix(char* s,int q)
{
int strl,sufl;
strl=strlen(s);
sufl=strlen(suffixes[q]);
if(strl>=sufl+4 && !strcmp(s+strl-sufl,suffixes[q]))
 {s[strl-sufl]=0;return 1;}
return 0;
}
int _prefix(char* s,int q)
{
int strl,prefl,i;
strl=strlen(s);
prefl=strlen(prefixes[q]);
if(strl>=prefl+4 && !strncmp(s,prefixes[q],prefl))
 {
 for(i=0;i<strl-prefl;++i)
  s[i]=s[i+prefl];
  s[strl-prefl]=0;
 return 1;
 }
return 0;
}

char* vocab_p(int i)
{
if(v->len[i]==-1)return 0;
return &(v->head[v->len[i]]);
}

void vocab_load(const char* filename)
{
int i,offset,t,nwords,totalsize;
char* s;
FILE* f;
f=fopen(filename,"rb");
if(!f){printf("Can't open %s!\n",filename);return;}

s=malloc(WMAXLEN);
for(nwords=totalsize=0;;)
 {
 t=fscanf(f,"%s",s);
 if(t==EOF)break;
 totalsize+=strlen(s);
 ++nwords;
 }
totalsize+=nwords;

v->n=nwords;
v->len=malloc(4*nwords);
v->head=malloc(totalsize);

fseek(f,0,SEEK_SET);
offset=0;
for(i=0;i<nwords;++i)
 {
 fscanf(f,"%s",v->head+offset);
 v->len[i]=offset;
 offset+=strlen(v->head+offset)+1;
 }
free(s);
fclose(f);
/*printf("vocab_load(\"%s\"): nwords=%d\n",filename,nwords);*/
}
void vocab_drop()
{
free(v->len);
free(v->head);
}

void vocab_remove_affix()
{
int i,j;
char* s;
for(i=0;i<v->n;++i)
 {
 s=vocab_p(i);
 if(!s)continue;
 if(!sanity(s))
  {v->len[i]=-1;continue;}
 for(j=0;j<NSUFFIXES;++j)
  _suffix(s,j);
 for(j=0;j<NPREFIXES;++j)
  _prefix(s,j);
 }
}

int _index3(char* s)
{
int addr;
addr=(s[0]=='\'')?26:s[0]-'a';
addr=addr*27+((s[1]=='\'')?26:s[1]-'a');
addr=addr*27+((s[2]=='\'')?26:s[2]-'a');
return addr;
}
int _index4(char* s)
{
int addr;
addr=(s[0]=='\'')?26:s[0]-'a';
addr=addr*27+((s[1]=='\'')?26:s[1]-'a');
addr=addr*27+((s[2]=='\'')?26:s[2]-'a');
addr=addr*27+((s[3]=='\'')?26:s[3]-'a');
return addr;
}

void vocab_trigrams_stat()
{
int i,L;
char* s;
memset(prefix3,0,27*27*27*4);
memset(suffix3,0,27*27*27*4);
memset(suffix4,0,27*27*27*27*4);
s=malloc(WMAXLEN);
for(i=0;i<v->n;++i)
 {
 if(!vocab_p(i))continue;
 strcpy(s,vocab_p(i));
 L=strlen(s);
 if(L>LPREF)
  prefix3[_index3(s)]++;
 if(L>LSUF)
  suffix3[_index3(s+L-3)]++;
 if(L>LSUF+1)
  suffix4[_index4(s+L-4)]++;
 }
free(s);
}

unsigned int jhash(char* a)
{
unsigned int h;
for(h=0;*a;++a)
 {
 h+=*a;
 h+=h<<10;
 h^=h>>6;
 }
h+=h<<3;
h^=h>>11;
h+=h<<15;
return h;
}

void bloom_init(int _size)
{
bloom->size=_size;
bloom->head=malloc(_size);
memset(bloom->head,0,bloom->size);
}

void bloom_drop()
{
free(bloom->head);
}
void bloom_set(unsigned int key)
{
key%=8*bloom->size;
bloom->head[key/8]|=1<<(key%8);
}
int bloom_get(unsigned int key)
{
key%=8*bloom->size;
return ((bloom->head[key/8])>>(key%8))&1;
}
void bloom_stat()
{
int i,s;
s=0;
for(i=0;i<8*bloom->size;++i)
 s+=((bloom->head[i/8])>>(i%8))&1;
/*printf("bloom_stat(): %.2f%%\n",12.5f*s/bloom->size);*/
}

void vocab_to_bloom()
{
int i;
char* s;
for(i=0;i<v->n;++i)
 {
 s=vocab_p(i);
 if(!s)continue;
 bloom_set(jhash(s));
 }
}

void vocab_check()
{
int i,L,s;
char*b;
s=0;
for(i=0;i<v->n;++i)
 {
 b=vocab_p(i);
 if(!b)continue;
 L=strlen(b);
 if((L>LPREF && prefix3[_index3(b)]<PREFLIM) ||
  (L>LSUF && suffix3[_index3(b+strlen(b)-3)]<SUFLIM) ||
  (L>LSUF+1 && suffix4[_index4(b+strlen(b)-4)]<SUFLIM4))
  ++s,
  v->len[i]=-1;
 }
/*printf("vocab_check(): rejected %d words\n",s);*/
}

void make_blob(char* filename)
{
int i;
char* d;
FILE* f;
f=fopen(filename,"wb");

d=malloc(LARGE);
memset(d,0,LARGE);
for(i=0;i<27*27*27;++i)
 d[i/8]|=(prefix3[i]<PREFLIM)<<(i%8);
fwrite(d,1,SMALL,f);

memset(d,0,LARGE);
for(i=0;i<27*27*27;++i)
 d[i/8]|=(suffix3[i]<SUFLIM)<<(i%8);
fwrite(d,1,SMALL,f);

memset(d,0,LARGE);
for(i=0;i<27*27*27*27;++i)
 d[i/8]|=(suffix4[i]<SUFLIM4)<<(i%8);
fwrite(d,1,LARGE,f);

fwrite(bloom->head,1,bloom->size,f);

fclose(f);
free(d);
}


void generate(char* name)
{
v=&_v;
bloom=&_bloom;

vocab_load("data\\w.txt"); //cat words.txt | tr A-Z a-z | sort | uniq > w.txt
vocab_remove_affix();
vocab_trigrams_stat();
vocab_check();
vocab_trigrams_stat();
vocab_check();

bloom_init(BLOOMSIZE);
vocab_to_bloom();
bloom_stat();

make_blob(name);

vocab_drop();
bloom_drop();
}

float test(char* filename)
{
int fn,fp,t,isword,nwords,nnowords;
FILE* f;
char* w;
float result;
fn=fp=nwords=nnowords=0;
w=malloc(1024);
f=fopen(filename,"rb");

if(!f){printf("Can't load %s!\n",filename);return 0.f;}
for(;;)
 {
 t=fscanf(f,"%d %s",&isword,w);
 if(t==EOF)break;
 t=solver(w);
 if(isword)++nwords;
 else ++nnowords;
 if(isword && !t)++fn;
 if(!isword && t)++fp;
 }
fclose(f);
free(w);
result=100.f*(1.f-((float)fn+fp)/(nwords+nnowords));
printf("test(\"%s\"):\n%d words, %d nowords\nfn: %.2f%%\nfp: %.2f%%\noverall: %.2f%%\n",
 filename,
 nwords,nnowords,
 100.f*fn/nwords,100.f*fp/nnowords,
 result);
return result;
}

int main()
{
generate("bf/data");
solver_init("bf/data");
printf("%.4f\n",test("data\\tests1600k.dat"));
return 0;
}
