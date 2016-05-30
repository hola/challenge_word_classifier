#include "solver.h"

char* solver_suffixes[NSUFFIXES]={"'s","s","ed","ing","able","ly","nes","er","ation"};
char* solver_prefixes[NPREFIXES]={"over","non","under","un","pre","anti","inter","out","semi","sub","super"};

Bloom _solver_bloom;
Bloom* solver_bloom;

void solver_init(char* filename)
{
FILE* f;
solver_bloom=&_solver_bloom;
solver_bloom->size=BLOOMSIZE;
solver_bloom->head=malloc(BLOOMSIZE);
memset(solver_bloom->head,0,BLOOMSIZE);

f=fopen(filename,"rb");
//if(!f){printf("load_blob(%s): no such file!\n",filename);return;}
fread(solver_pre3,1,SMALL,f);
fread(solver_suf3,1,SMALL,f);
fread(solver_suf4,1,LARGE,f);
fread(solver_bloom->head,1,solver_bloom->size,f);
fclose(f);
}

int solver_index(char* s)
{
int addr;
addr=
((s[0]=='\'')?26:s[0]-'a')*27*27+
((s[1]=='\'')?26:s[1]-'a')*27+
((s[2]=='\'')?26:s[2]-'a');
return addr;
}

int solver(char* a)
{
int i,L,L2,q,t;
int T1,T2,T3;
unsigned int h;
char* s;

T1=T2=T3=0;
L=strlen(a);
if(L<2 || L>16)return 0;
for(i=0;i<L;++i)
 {
 t=a[i]-'a';
 if(t<0)
  ++T1;
 else
  {
  if((CONSONANTS>>t)&1){T3=0;if(++T2>6)return 0;}
  else {T2=0;if(++T3>4)return 0;}
  }
 }
if(T1>1 || (T1 && strcmp(&a[L-2],"\'s")))return 0;

s=malloc(WMAXLEN);
strcpy(s,a);

for(q=0;q<NSUFFIXES;++q)
 {
 L2=strlen(solver_suffixes[q]);
 if(L>=L2+4 && !strcmp(s+L-L2,solver_suffixes[q]))
  {s[L-L2]=0;L-=L2;}
 }
for(q=0;q<NPREFIXES;++q)
 {
 L2=strlen(solver_prefixes[q]);
 if(L>=L2+4 && !strncmp(s,solver_prefixes[q],L2))
  {
  for(i=0;i<L-L2;++i)
   s[i]=s[i+L2];
  s[L-L2]=0;
  L-=L2;
  }
 }

h=0;
for(i=0;i<L;++i)
 {
 h+=s[i];
 h+=h<<10;
 h^=h>>6;
 }
h+=h<<3;
h^=h>>11;
h+=h<<15;

T1=solver_index(s);
T2=solver_index(s+L-3);
T3=solver_index(s+L-4);
T3=T3*27+((s[L-1]=='\'')?26:s[L-1]-'a');
free(s);


if((L>LPREF && ((solver_pre3[T1/8]>>(T1%8))&1)) ||
(L>LSUF && ((solver_suf3[T2/8]>>(T2%8))&1))||
(L>LSUF+1 && ((solver_suf4[T3/8]>>(T3%8))&1)))return 0;

h%=8*solver_bloom->size;
return ((solver_bloom->head[h/8])>>(h%8))&1;
return 1;
}


