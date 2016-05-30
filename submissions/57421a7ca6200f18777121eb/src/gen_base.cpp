/*
   JS Challenge Spring 2016: Word Classifier
   https://github.com/hola/challenge_word_classifier

   Код, который генерирует базу для файла word_classifier.js.
   Cтатичное выделение памяти, нет контроля ошибок и пр.
   В рабочем каталоге должен находиться исходный файл словаря английских слов words.txt 

*/

#include <stdio.h>
#include <locale.h>
#include <conio.h>
#include <string.h>
#include <stdlib.h>

#define MAX_LETTERS 27
#define MAX_CHARS 500
#define MAX_WORDS 700000
#define MAX_WORD_LENGTH_CUT 25

typedef unsigned __int32 ui32;

char path_words[]="words.txt";
char path_words2[]="words2.txt";
char path_base[]="base.dat";
char path_false[]="false_words.txt";
char path_true[]="true_words.txt";

int words_count=0;
typedef struct _tword
{
   char  word[MAX_CHARS];
} tword;
tword words[MAX_WORDS]={0};

typedef struct _TBloomFilter
{
   char *bitfield;
   int bf_size_bytes;
   int bf_size;
} TBloomFilter;
TBloomFilter bf1,bf2,bf3,bf4,bf5;

typedef struct _tbf_params
{
   int type; 
   int sc;
   int sc_ind;
   int let_ind;
   int ap_s;
   int ap;
   int gs;
   char *fpath;
   char *foutpath;
   int what;
   TBloomFilter *bf;

} tbf_params;

typedef struct _tperexod
{
   int nb[MAX_LETTERS][MAX_LETTERS];
} tperexod;
tperexod perexods[MAX_CHARS][MAX_CHARS]={0};

int char_to_ind(char bukva)
{
   if (bukva!=0x27) return bukva-0x61;
   else  return 26;
}

int char_to_hash_ind(char bukva)
{
   if (bukva=='a'||bukva=='e'||bukva=='i'||bukva=='o'||bukva=='u'||bukva=='y') return 1;
   else if (bukva=='\'') return 3;
   else return 2;
}

ui32 hash1 (char *str, ui32 len)
{
   ui32 hash = 0,i;
   for (i = 0; i < len; i++)
   { hash = (hash * 1664525) + (unsigned char)(str[i]) + 1013904223; }
   return hash;
}

ui32 hash2 (char *str, ui32 len)
{
   ui32 hash = 0,i;
   for (i = 0; i < len; i++)
   { hash = (hash * 1664525) + char_to_hash_ind(str[i]) + 1013904223; }
   return hash;
}

ui32 hash3 (char *str, ui32 len, ui32 d)
{
   ui32 hash = 0,i,j,dlina=d;
   if (len<=dlina)
   {
      for (i = 0; i < len; i++) 
         hash = (hash * 1664525) + (unsigned char)(str[i]) + 1013904223;
   }
   else
   {
      for (i=0;i<=(len-dlina);i++)
         for (j=i;j<(dlina+i);j++)
            hash = (hash * 1664525) + (unsigned char)(str[j]) + 1013904223;
   }
   return hash;
}

void setbit(char *field, int ind)
{
   char *b = 0;   
   b = (char*)field+ind/8;
   *b |=(1 << (ind % 8));
}
unsigned __int8 testbit(char* field, int ind)
{
   char *b = NULL;
   b = (char*)field + ind/8;
   return (*b>>(ind%8))&1;
}


void CreateBloomFilter(tbf_params *bf_params)
{
   int len,len2;
   int zeroes,one_digits,ind;
   int i;
   FILE *fout=0;
   __int8 bit;
   char *ptr1,*ptr2;
   char buf[MAX_CHARS],buf2[MAX_CHARS],buf3[MAX_CHARS];
   TBloomFilter *bf=bf_params->bf;

   bf->bitfield=(char *)malloc(bf->bf_size_bytes);
   if (bf->bitfield==0)
   {
      printf("Ошибка: malloc\n");
      return;
   }
   memset(bf->bitfield,0,bf->bf_size_bytes);

   //заполняем
   for (int word_ind=0;word_ind<words_count;word_ind++)
   {
      ind=char_to_ind(words[word_ind].word[0]);
      strcpy_s(buf,MAX_CHARS,words[word_ind].word);

      if ((bf_params->let_ind>=0)&&(bf_params->let_ind!=ind)) continue;
      if (bf_params->ap_s)
      {
         len=strlen(buf);
         if (len<2) continue;
         if (!((buf[len-1]=='s')&&(buf[len-2]=='\''))) continue;
         //else buf[len-2]=0;
      }
      if (bf_params->ap) 
      {
         if (strchr(buf,'\'')==0) continue;
      }


      len=strlen(buf);
      if ((bf_params->type==0))
      {
         //n букв сначала начиная с определенного индекса
         if (len<=bf_params->sc_ind)
         {
            len2=0;
            buf2[0]=0;
         }
         else if (len<(bf_params->sc_ind+bf_params->sc))
         {
            len2=len-(bf_params->sc_ind);
            strncpy_s(buf2,MAX_CHARS,((char *)buf)+bf_params->sc_ind,len2);
         }
         else
         {
            len2=bf_params->sc;
            strncpy_s(buf2,MAX_CHARS,((char *)buf)+bf_params->sc_ind,len2);
         }
      }
      else if ((bf_params->type==1))
      {
         //n букв сначала начиная с определенного индекса
         if (len<=bf_params->sc_ind)
         {
            len2=len;
            strncpy_s(buf2,MAX_CHARS,buf,len2);
         }
         else if (len<(bf_params->sc_ind+bf_params->sc))
         {
            len2=len-(bf_params->sc_ind);
            strncpy_s(buf2,MAX_CHARS,((char *)buf)+bf_params->sc_ind,len2);
         }
         else
         {
            len2=bf_params->sc;
            strncpy_s(buf2,MAX_CHARS,((char *)buf)+bf_params->sc_ind,len2);
         }
      }
      else if (bf_params->type==2)
      {
         //n букв с конца
         if (len>bf_params->sc)
         {
            len2=bf_params->sc;
            strncpy_s(buf2,MAX_CHARS,((char *)buf)+(len-len2),len2);
         }
         else
         {
            len2=len;
            strncpy_s(buf2,MAX_CHARS,buf,len2);
         }
      }
      else if (bf_params->type==3)
      {
         //n букв сначала через одну
         len2=len<bf_params->sc?len:bf_params->sc;
         buf2[0]=0;
         for (i=0;i<len2;i+=2)
         {
            strncat_s(buf2,MAX_CHARS,((char *)buf)+i,1);
         }
      }
      else if (bf_params->type==4)
      {
         ptr1=strchr(buf,'\'');
         ptr2=strrchr(buf,'\'');
         if (ptr1==ptr2)
         {
            len2=len;
            strncpy_s(buf2,MAX_CHARS,buf,len2);
         }
         else if ((ptr2-ptr1)==1)
         {
            len2=0;
            buf2[0]=0;
         }
         else
         {
            len2=ptr2-ptr1;
            strncpy_s(buf2,MAX_CHARS,ptr1+1,len2-1);
         }
      }
      else if (bf_params->type==7)
      {
         if ((len-1)<=bf_params->sc_ind)
         {
            len2=0;
            buf3[0]=0;
         }
         else if ((len-1)<(bf_params->sc_ind+bf_params->sc))
         {
            len2=(len-1)-(bf_params->sc_ind);
            strncpy_s(buf3,MAX_CHARS,((char *)buf)+bf_params->sc_ind,len2);
         }
         else
         {
            len2=bf_params->sc;
            strncpy_s(buf3,MAX_CHARS,((char *)buf)+bf_params->sc_ind,len2);
         }

         strncpy_s(buf2,MAX_CHARS,((char *)buf+len-1),1); //последняя буква
         strcat_s(buf2,MAX_CHARS,buf3);
         len2=strlen(buf2);
      }

      if (bf_params->gs==0)
         setbit(bf->bitfield,(hash1(buf2,len2))%bf->bf_size);
      else if (bf_params->gs==1)
         setbit(bf->bitfield,(hash2(buf2,len2))%bf->bf_size);
      else if (bf_params->gs==2)
         setbit(bf->bitfield,(hash3(buf2,len2,5))%bf->bf_size);
   }

   //считаем кол-во нулевых битов
   zeroes=0;
   one_digits=0;
   for (i=0;i<bf->bf_size;i++)
   {
      if (!testbit(bf->bitfield,i)) zeroes++;
      else one_digits++;
   }

   printf("\n\nNEW Bloom Filter:\nbf_params.sc=%d\nbf_params.sc_ind=%d\nнулей=%d\nединиц=%d\n",bf_params->sc,bf_params->sc_ind,zeroes,one_digits);

   fout=fopen(bf_params->foutpath,"ab");
   fwrite(bf->bitfield,1,bf->bf_size_bytes,fout);
   //for (i=0;i<bf_size;i++)
   //{
   //  bit=testbit(bitfield,i);
   //  fwrite(&bit,1,1,fout);
   //}
   fclose(fout);
}

void DestroyBloomFilters()
{
   if (bf1.bitfield) free(bf1.bitfield);
   bf1.bitfield=0;

   if (bf2.bitfield) free(bf2.bitfield);
   bf2.bitfield=0;

   if (bf3.bitfield) free(bf3.bitfield);
   bf3.bitfield=0;

   if (bf4.bitfield) free(bf4.bitfield);
   bf4.bitfield=0;

   if (bf5.bitfield) free(bf5.bitfield);
   bf5.bitfield=0;
}

void TestBloomFilter(tbf_params *bf_params)
{
   FILE *ft=0;
   int len,len2,i;
   char buf[MAX_CHARS];
   char buf2[MAX_CHARS];
   char buf3[MAX_CHARS];
   bool result;
   char *ptr1,*ptr2;
   int f_count=0,t_count=0,bit1,bit2,bit3,ind;
   TBloomFilter *bf=bf_params->bf;

   ft=fopen(bf_params->fpath,"rb");
   if (ft==0)
   { 
      printf("Ошибка: невозможно открыть файл %s\n",bf_params->fpath);
      return;
   }

   while(!feof(ft))
   {
      if (!fgets(buf,MAX_CHARS,ft)) break;
      //_strlwr(buf);
      len=strlen(buf);
      if (len>=(MAX_CHARS-1))
      {
         printf("Возможно превышена максимально допустимая длина слова: %d символов\n",MAX_CHARS);
         return;
      }
      if (buf[len]==0x0D||buf[len]==0x0A) buf[len]=0;
      if (buf[len-1]==0x0D||buf[len-1]==0x0A) buf[len-1]=0;
      len=strlen(buf);

      if (len<=0) continue;

      ind=char_to_ind(buf[0]);

      if ((bf_params->let_ind>=0)&&(bf_params->let_ind!=ind)) continue;
      if (bf_params->ap_s)
      {
         if (len<2) continue;
         if (!((buf[len-1]=='s')&&(buf[len-2]=='\''))) continue;
         //else buf[len-2]=0;
      }
      if (bf_params->ap) 
      {
         if (strchr(buf,'\'')==0) continue;
      }

      len=strlen(buf);
      if (bf_params->type==0)
      {

         //n букв сначала начиная с определенного индекса
         if (len<=bf_params->sc_ind)
         {
            len2=0;
            buf2[0]=0;
         }
         else if (len<(bf_params->sc_ind+bf_params->sc))
         {
            len2=len-(bf_params->sc_ind);
            strncpy_s(buf2,MAX_CHARS,((char *)buf)+bf_params->sc_ind,len2);
         }
         else
         {
            len2=bf_params->sc;
            strncpy_s(buf2,MAX_CHARS,((char *)buf)+bf_params->sc_ind,len2);
         }

      }

      if (bf_params->type==1)
      {

         //n букв сначала начиная с определенного индекса
         if (len<=bf_params->sc_ind)
         {
            len2=len;
            strncpy_s(buf2,MAX_CHARS,buf,len2);
         }
         else if (len<(bf_params->sc_ind+bf_params->sc))
         {
            len2=len-(bf_params->sc_ind);
            strncpy_s(buf2,MAX_CHARS,((char *)buf)+bf_params->sc_ind,len2);
         }
         else
         {
            len2=bf_params->sc;
            strncpy_s(buf2,MAX_CHARS,((char *)buf)+bf_params->sc_ind,len2);
         }

      }
      else if (bf_params->type==2)
      {
         //n букв с конца
         if (len>bf_params->sc)
         {
            len2=bf_params->sc;
            strncpy_s(buf2,MAX_CHARS,((char *)(buf))+(len-len2),len2);
         }
         else
         {
            len2=len;
            strncpy_s(buf2,MAX_CHARS,buf,len2);
         }
      }
      else if (bf_params->type==3)
      {
         //n букв сначала через одну
         len2=len<bf_params->sc?len:bf_params->sc;
         buf2[0]=0;
         for (i=0;i<len2;i+=2)
         {
            strncat_s(buf2,MAX_CHARS,((char *)buf)+i,1);
         }
      }
      else if (bf_params->type==4)
      {
         ptr1=strchr(buf,'\'');
         ptr2=strrchr(buf,'\'');
         if (ptr1==ptr2)
         {
            len2=len;
            strncpy_s(buf2,MAX_CHARS,buf,len2);
         }
         else if ((ptr2-ptr1)==1)
         {
            len2=0;
            buf2[0]=0;
         }
         else
         {
            len2=ptr2-ptr1;
            strncpy_s(buf2,MAX_CHARS,ptr1+1,len2-1);
         }
      }
      else if (bf_params->type==7)
      {
         if ((len-1)<=bf_params->sc_ind)
         {
            len2=0;
            buf3[0]=0;
         }
         else if ((len-1)<(bf_params->sc_ind+bf_params->sc))
         {
            len2=(len-1)-(bf_params->sc_ind);
            strncpy_s(buf3,MAX_CHARS,((char *)buf)+bf_params->sc_ind,len2);
         }
         else
         {
            len2=bf_params->sc;
            strncpy_s(buf3,MAX_CHARS,((char *)buf)+bf_params->sc_ind,len2);
         }

         strncpy_s(buf2,MAX_CHARS,((char *)buf+len-1),1); //последняя буква
         strcat_s(buf2,MAX_CHARS,buf3);
         len2=strlen(buf2);
      }


      if (bf_params->gs==0)
         bit1=testbit(bf->bitfield,(hash1(buf2,len2))%bf->bf_size);
      else if (bf_params->gs==1)
         bit1=testbit(bf->bitfield,(hash2(buf2,len2))%bf->bf_size);
      else if (bf_params->gs==2)
         bit1=testbit(bf->bitfield,(hash3(buf2,len2,5))%bf->bf_size);

      if (bit1==0)//||bit2==0)//||bit3==0)
         f_count++;
      else
         t_count++;
   }

   fclose(ft);
   printf("\nfalse: %d\ntrue: %d\n",f_count,t_count);
   printf("%.2lf\n",(100.0*f_count/(f_count+t_count)));
}  

int FCompareStr(const void *a,const void *b)
{
   tword *i,*j;

   i=(tword *)a;
   j=(tword *)b;

   return strcmp(i->word,j->word);
}

void QuickSortStr(tword *v,int count)
{
   qsort(v,count,sizeof(tword),FCompareStr);
}

int make_words(char *path1,char *path2)
{
   FILE *fin=0,*fout=0;
   int len,i,j,words_count2;
   char buf[MAX_CHARS];
   char buf2[MAX_CHARS];

   fin=fopen(path1,"rb");
   if (fin==0)
   { 
      printf("Ошибка: невозможно открыть файл  %s\n",path1);
      return -1;
   }
   fout=fopen(path2,"wb");

   //заполняем словарь
   words_count=0;
   while(!feof(fin))
   {
      if (!fgets(buf,MAX_CHARS,fin)) break;
      _strlwr(buf);

      len=strlen(buf);
      if (len>=(MAX_CHARS-1))
      {
         printf("Возможно превышена максимально допустимая длина слова: %d символов\n",MAX_CHARS);
         return -1;
      }
      if (buf[len]==0x0D||buf[len]==0x0A) buf[len]=0;
      if (buf[len-1]==0x0D||buf[len-1]==0x0A) buf[len-1]=0;
      len=strlen(buf);

      if (len<=0) continue;

      strcpy(words[words_count++].word,buf);
   }

   QuickSortStr(words,words_count);

   //удаляем повторения и выводим в файл
   i=0;
   words_count2=0;
   while (i<words_count)
   {
      fprintf(fout,"%s\n",words[i].word);
      words_count2++;

      //пропускаем повторы
      for (j=i+1;j<words_count;j++) 
      {
         if (strcmp(words[i].word,words[j].word)!=0) break;
      }

      i=j;
   }

   fclose(fin);
   fclose(fout);

   printf ("Кол-во слов изначально: %d\n",words_count);
   printf ("Кол-во слов после упаковки: %d\n",words_count2);

   return 1;
}

int load_words(char *path)
{
   FILE *fin=0;
   int len;
   char buf[MAX_CHARS];

   fin=fopen(path,"rb");
   if (fin==0)
   { 
      printf("Ошибка: невозможно открыть файл %s\n",path);
      return -1;
   }

   //заполняем словарь
   words_count=0;
   while(!feof(fin))
   {
      if (!fgets(buf,MAX_CHARS,fin)) break;
      //_strlwr(buf);
      len=strlen(buf);
      if (len>=(MAX_CHARS-1))
      {
         printf("Возможно превышена максимально допустимая длина слова: %d символов\n",MAX_CHARS);
         return -1;
      }
      if (buf[len]==0x0D||buf[len]==0x0A) buf[len]=0;
      if (buf[len-1]==0x0D||buf[len-1]==0x0A) buf[len-1]=0;
      len=strlen(buf);
      if (len<=0) continue;
      strcpy(words[words_count++].word,buf);
   }

   fclose(fin);

   return 1;
}


void make_base1(FILE *fout)
{
   tbf_params bf_params={0};

   bf_params.fpath=path_false;
   bf_params.what=0;
   bf_params.foutpath=path_base;

   memset(&bf1,0,sizeof(TBloomFilter));
   memset(&bf2,0,sizeof(TBloomFilter));
   memset(&bf3,0,sizeof(TBloomFilter));
   memset(&bf4,0,sizeof(TBloomFilter));
   memset(&bf5,0,sizeof(TBloomFilter));

   bf1.bf_size_bytes=22400;
   bf1.bf_size=bf1.bf_size_bytes*8;

   bf2.bf_size_bytes=18750;
   bf2.bf_size=bf2.bf_size_bytes*8;

   bf3.bf_size_bytes=7200;
   bf3.bf_size=bf3.bf_size_bytes*8;

   bf4.bf_size_bytes=2000;
   bf4.bf_size=bf4.bf_size_bytes*8;

   bf5.bf_size_bytes=700;
   bf5.bf_size=bf5.bf_size_bytes*8;

   bf_params.bf=&bf1;
   bf_params.type=1;
   bf_params.sc=5;
   bf_params.sc_ind=0;
   bf_params.let_ind=-1;
   bf_params.ap_s=0;
   bf_params.ap=0;
   bf_params.gs=0;
   CreateBloomFilter(&bf_params);
   //TestBloomFilter(&bf_params);

   bf_params.bf=&bf2;
   bf_params.type=0;
   bf_params.sc=6;
   bf_params.sc_ind=5;
   bf_params.let_ind=-1;
   bf_params.ap_s=0;
   bf_params.ap=0;
   bf_params.gs=0;
   CreateBloomFilter(&bf_params);
   //TestBloomFilter(&bf_params);

   bf_params.bf=&bf3;
   bf_params.type=7;
   bf_params.sc=7;
   bf_params.sc_ind=8;
   bf_params.let_ind=-1;
   bf_params.ap_s=0;
   bf_params.ap=0;
   bf_params.gs=0;
   CreateBloomFilter(&bf_params);
   //TestBloomFilter(&bf_params);

   /*
   bf_params.bf=&bf4;
   bf_params.type=0;
   bf_params.sc=12;
   bf_params.sc_ind=11;
   bf_params.let_ind=-1;
   bf_params.ap_s=0;
   bf_params.ap=0;
   bf_params.gs=0;
   CreateBloomFilter(&bf_params);
   //TestBloomFilter(&bf_params);*/

}

void make_base2(FILE *fout)
{
   char buf[MAX_CHARS],buf2[MAX_CHARS];
   char word_max[MAX_CHARS];
   int len,len2,max_len,count;
   int groups_count=0;
   int w_count_groups=0,w_count_groups4=0;
   int g4ind;   
   int ind,i,j,v,k,cur_ind,sum,ind1,ind2,ind3,ind4,max_lets_count;
   //int letters[MAX_CHARS][MAX_LETTERS];
   unsigned __int32 bits,bit1,bit2,bit3;
   int ft_count,pcount,pars_count,sum_pars_count,summa_bukv,cur_count,hash_val,znak;
   max_len=0;
   count=0;

   for (int word_ind=0;word_ind<words_count;word_ind++)
   {
      strcpy(buf,words[word_ind].word);
      len=strlen(buf);
      ind=char_to_ind(buf[0]); //первая буква

      //заполняем таблицы переходов
      max_lets_count=len<MAX_WORD_LENGTH_CUT?len:MAX_WORD_LENGTH_CUT;
      for (i=0;i<(max_lets_count-1);i++)
      {
         for (j=i+1;j<max_lets_count;j++)
         {
            ind1=char_to_ind(buf[i]);
            ind2=char_to_ind(buf[j]);
            ((perexods[i][j]).nb[ind1][ind2])++;
         }
      }
   }

   //распечатываем переходы
   unsigned __int32 bits32=0;
   __int32  bits_count=0,all_bits_count,zero_in_perexod=0;
   int karta_count=MAX_LETTERS*MAX_LETTERS;
   max_lets_count=MAX_WORD_LENGTH_CUT;
   for (k=0;k<(max_lets_count-1);k++)
   {
      for (v=k+1;v<max_lets_count;v++)
      {

         all_bits_count=0; i=0; j=0;
         while (all_bits_count<karta_count)
         {
            bits32=0; 
            for (bits_count=0;bits_count<32;bits_count++)
            {
               if ((perexods[k][v]).nb[i][j]>0) bits32|=(1<<(bits_count));
               else zero_in_perexod++;
               all_bits_count++;
               if (all_bits_count>=karta_count) break;
               i=all_bits_count/MAX_LETTERS;
               j=all_bits_count%MAX_LETTERS;
            }
            fwrite(&bits32,1,4,fout);
         }
      }
   }

   printf("\nПереходы расчитаны и сохранены в базе.\n");
}

int wmain(int argc, wchar_t* argv[])
{
   FILE *fout=0;

   setlocale(LC_ALL,"Russian");

   if (make_words(path_words,path_words2)!=1) return -1;
   if (load_words(path_words2)!=1) return -1;
   
   remove(path_base);
   fout=fopen(path_base,"ab");
   make_base1(fout);
   make_base2(fout);
   fclose(fout);

   DestroyBloomFilters();   
   printf("\nСделано!\n");

   //_getch();
   return 0;
}