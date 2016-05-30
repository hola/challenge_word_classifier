#include <stdio.h>
#include <string.h>
#include <ctype.h>
#include <stdlib.h>

#define WORD_LEN 150
int WORDS_CNT_MAX = 630500;
int WORDS_CNT 	  = 0;

int cmp_str(const void *, const void *);
int cmp_len(const void *, const void *);

int main(int argc, char *argv[])
{
	FILE *fi, *fo;

	if (argc == 4) {
		WORDS_CNT = atoi(argv[3]);
	}

	char word[WORD_LEN + 1];
	char *words[WORDS_CNT_MAX + 1];
	int i, cnt;

	// check
	if (argc < 3) {
		printf("%s in.txt out.txt #words_cnt\n", argv[0]);
		return -1;
	}

	// open
	fi = fopen(argv[1], "r");
	fo = fopen(argv[2], "w");

	if (fi == NULL || fo == NULL) {
		printf("can't open file\n");
		return -1;
	}

	// read
	cnt = 0;
	while (fgets(word, WORD_LEN, (FILE *) fi)) {
		int len = strlen(word);
		words[cnt] = (char *) malloc(len);
		word[strcspn(word, "\n")] = 0;
		strcpy(words[cnt], word);
		cnt++;
	}
	words[cnt] = '\0';

	// sort
	// qsort(words, cnt, sizeof(char *), cmp_str);
	qsort(words, cnt, sizeof(char *), cmp_len);

	// set minimal
	if (WORDS_CNT && WORDS_CNT < cnt) {
		cnt = WORDS_CNT;
	}

	printf("WORDS_CNT = %d;\n", cnt);

	int min_len = 100;
	int max_len = 0;
	int last_len = 0;

	// write first cnt
	for (i = 0; i < cnt; i++) {
		fprintf(fo, "%s\n", words[i]);

		int len = strlen(words[i]);
		last_len = len;

		if (len < min_len)
			min_len = len;

		if (len > max_len)
			max_len = len;

		// дозаписать остальные такой же длины
		// if (i == cnt - 1) {
		// 	if (words[i + 1] && strlen(words[i + 1]) == last_len)
		// 		cnt++;
		// }

		free(words[i]);
	}

	fclose(fi);
	fclose(fo);

	printf("MIN_LEN = %d;\n", min_len);
	printf("MAX_LEN = %d;\n", max_len);
	printf("WORDS_CNT = %d;\n", cnt);


	return 0;
}

int cmp_str (const void *str1, const void *str2)
{
	char str[] = "spcambtdruhegnfilowkvjzqyx'";
	const char *pstr1 = *(const char **) str1;
    const char *pstr2 = *(const char **) str2;

	// return strcmp(pa, pb);

	// printf("%s:\n%s\n", pa, pb);

	while (*pstr1 && *pstr2 && *pstr1 == *pstr2) {
		*pstr1++;
		*pstr2++;
	}

	if (!*pstr1 && *pstr2) {
		return -1;
	}

	if (*pstr1 && !*pstr2) {
		return 1;
	}

	char c1, c2;
	memcpy(&c1, pstr1, 1);
	memcpy(&c2, pstr2, 1);

	// printf("%s:%s\n", pa, pb);
	// printf("%c:%c\n", c1, c2);

	return strchr(str, c1) - strchr(str, c2);
}

int cmp_len(const void *str1, const void *str2) {
	int lens[] = {9, 8, 10, 7, 11, 6, 12, 13, 5, 14, 15, 4, 16, 3, 17, 18, 19, 2, 20, 21, 22, 23, 1, 24, 25, 29, 27, 28, 26, 31, 30, 32, 45, 33, 58, 34, 60};
	const char *pstr1 = *(const char **) str1;
    const char *pstr2 = *(const char **) str2;
    int len1 = strlen(pstr1);
    int len2 = strlen(pstr2);
    int cnt = sizeof(lens);
    int i;

    if (len1 == len2) {
    	return 0;
    }

    for (i = 0; i < cnt; i++) {
    	if (lens[i] == len1) {
    		return -1;
    	}

    	if (lens[i] == len2) {
    		return 1;
    	}
    }

	return len1 - len2;
}