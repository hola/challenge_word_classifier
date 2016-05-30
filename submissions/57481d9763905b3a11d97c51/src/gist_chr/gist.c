#include <stdio.h>
#include <string.h>
#include <ctype.h>

#define WORD_LEN 150
#define ALHPA 27

int main(int argc, char *argv[])
{
	FILE *fp;
	int arr_cnt[ALHPA];
	int arr_chr[ALHPA];

	char word[WORD_LEN];
	int i, j;
	int ch;

	if (argc < 2) {
		printf("%s ../words/in.txt\n", argv[0]);
		return -1;
	}

	fp = fopen(argv[1], "r");

	if (fp == NULL) {
		printf("can't open file\n");
		return -1;
	}

	for (i = 0; i < ALHPA; i++) {
		arr_cnt[i] = 0;
		arr_chr[i] = 'a' + i;
	}
	arr_cnt[26] = 0;
	arr_chr[26] = '\'';


	while ((ch = fgetc(fp)) != EOF) {
		//fprintf(stderr, "%d\n", ch);
		if (isalpha(ch)) {
			ch = tolower(ch);
			arr_cnt[ch - 'a']++;
		} else if (ch = '\'') {
			arr_cnt[26]++;
		}
	}

	fclose(fp);

	for (i = 0; i < ALHPA; i++) {
		printf("%c\n", arr_chr[i]);
	}

	for (i = 0; i < ALHPA; i++) {
		printf("%d\n", arr_cnt[i]);
	}

	/*for (i = 0; i < ALHPA; i++) {
		printf("[%c] = %d\n", arr_chr[i], arr_cnt[i]);
	}*/

	printf("--------------------\n");
	int tmp;
	for (i = 0; i < ALHPA + 1; i++) {
		for (j = i + 1; j < ALHPA; j++) {
			if (arr_cnt[i] < arr_cnt[j]) {
				tmp = arr_cnt[i];
				arr_cnt[i] = arr_cnt[j];
				arr_cnt[j] = tmp;

				tmp = arr_chr[i];
				arr_chr[i] = arr_chr[j];
				arr_chr[j] = tmp;
			}
		}
	}

	for (i = 0; i < ALHPA; i++) {
		printf("[%c] = %d\n", arr_chr[i], arr_cnt[i]);
	}

/*	printf("--------------------\n");
	for (i = 0; i < ALHPA; i++) {
		printf("%c\n", arr_chr[i]);
	}

	printf("--------------------\n");
	for (i = 0; i < ALHPA; i++) {
		printf("%d\n", arr_cnt[i]);
	}
*/
	return 0;
}