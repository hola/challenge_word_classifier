#include <stdio.h>
#include <stdlib.h>
#include <ctype.h>
#include <string.h>

typedef unsigned char byte;
typedef unsigned long long qword;

#define WORDS "/home/mike/dev/node/challenge_word_classifier/wordz.txt"

#define N 2
#define MIN 1

// #define iswordl(c) 	((((c) >= 'a') && ((c) <= 'z')) || (((c) >= 'A') && ((c) <= 'Z')) || ((c) == '\''))
#define iswordl(c) 	1

#if N==2


int count[128][128];

void gram_init()
{
	for (int j = 0; j < 128; j++)
		for (int k = 0; k < 128; k++)
			count[j][k] = 0;
}

void gram_word(char *word)
{
	for (int k = 0; word[k+1] != '\n'; k++)
		count[word[k]][word[k+1]]++;
}

void gram_out()
{
	//printf("{\n");
	for (int j = 0; j < 128; j++)
		for (int k = 0; k < 128; k++)
			if (iswordl(j) && iswordl(k))
				if (count[j][k] >= MIN)
					printf("\"%c%c\":%d,\n", (char) j, (char) k, count[j][k]);
	//printf("\"\":0\n");
	//printf("}\n");
}
#endif

#if N==3
int count[128][128][128];

void gram_init()
{
	for (int i = 0; i < 128; i++)
		for (int j = 0; j < 128; j++)
			for (int k = 0; k < 128; k++)
				count[i][j][k] = 0;
}

void gram_word(char *word)
{
	for (int k = 0; (word[k+1] != '\n') && (word[k+2] != '\n'); k++)
		count[word[k]][word[k+1]][word[k+2]]++;
}

void gram_out()
{
	//printf("{\n");
	for (int i = 0; i < 128; i++)
		for (int j = 0; j < 128; j++)
			for (int k = 0; k < 128; k++)
				if (iswordl(i) && iswordl(j) && iswordl(k))
					if (count[i][j][k] >= MIN)
						printf("\"%c%c%c\":%d,\n", (char) i, (char) j, (char) k, count[i][j][k]);
	//printf("\"\":0\n");
	//printf("}\n");
}
#endif

#if N==4
int count[128][128][128][128];

void gram_init()
{
	for (int h = 0; h < 128; h++)
		for (int i = 0; i < 128; i++)
			for (int j = 0; j < 128; j++)
				for (int k = 0; k < 128; k++)
					count[h][i][j][k] = 0;
}

void gram_word(char *word)
{
	for (int k = 0; (word[k+1] != '\n') && (word[k+2] != '\n') && (word[k+3] != '\n'); k++)
		count[word[k]][word[k+1]][word[k+2]][word[k+3]]++;
}

void gram_out()
{
	//printf("{\n");
	for (int h = 0; h < 128; h++)
		for (int i = 0; i < 128; i++)
			for (int j = 0; j < 128; j++)
				for (int k = 0; k < 128; k++)
					if (iswordl(h) && iswordl(i) && iswordl(j) && iswordl(k) )
						if (count[h][i][j][k] >= MIN)
							printf("\"%c%c%c%c\":%d,\n", (char) h, (char) i, (char) j, (char) k, count[h][i][j][k]);
	//printf("\"\":0\n");
	//printf("}\n");
}
#endif

void gram(char *filename)
{
	int max = 0;
	gram_init();
	char s[150];
	char t[150];
	FILE *f = fopen(filename, "r");
	if (f == NULL)
		exit(1);

	while (fgets(s, sizeof(s), f) != NULL){
		if (max < strlen(s))
			max = strlen(s);
		for (int k = 0; s[k]; k++){
			if (s[k] > '~')
				s[k] = '?';
			else if (s[k] == '"')
				s[k] = '`';
		}			
		// sprintf(t, "<%.*s>\n", strlen(s)-1, s);
		gram_word(s);
	}
	fclose(f);

	printf("max length = %d\n", max - 1);
	gram_out();
}

void main(int argc, char *argv[])
{
	gram(WORDS);
	exit(0);
}
