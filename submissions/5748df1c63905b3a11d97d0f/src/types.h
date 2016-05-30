#ifndef DTYPES
#define DTYPES

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define WMAXLEN 64

#define NPREFIXES 11
#define NSUFFIXES 9

#define PREFLIM 5
#define SUFLIM 4
#define SUFLIM4 10
#define LPREF 2
#define LSUF 10

#define SMALL ((27*27*27+7)/8)
#define LARGE ((27*27*27*27+7)/8)

#define CONSONANTS 0x3EFBEEE

#define BLOOMSIZE 60480

typedef struct
{
int n;
int* len;
char* head;
} Vocab;
typedef struct
{
int size;
char* head;
} Bloom;

#endif
