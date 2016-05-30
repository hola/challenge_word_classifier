#include <stdio.h>
#include <string.h>

#define WORD_LEN 100

int main(int argc, char *argv[])
{
	FILE *fp;
	int arr_cnt[WORD_LEN] = {0};
	int arr_chr[WORD_LEN];
	long max_cnt = 1;
	char word[WORD_LEN];
	int i, j;

	if (argc < 2) {
		printf("%s ../words/in.txt\n", argv[0]);
		return -1;
	}

	fp = fopen(argv[1], "r");

	if (fp == NULL) {
		printf("can't open file\n");
		return -1;
	}


	for (i = 0; i < WORD_LEN; i++) {
		arr_chr[i] = i;
	}

	while (fgets(word, WORD_LEN, (FILE*) fp)) {
		int len = strlen(word) - 1;

		if (len) {
			arr_cnt[len] += 1;

			if (len > max_cnt)
				max_cnt = len;
		}
    }

	fclose(fp);



	for (i = 0; i <= max_cnt; i++) {
		if (arr_cnt[i] == 0)
			continue;
		printf("[%.2d] = %d;\n", arr_chr[i], arr_cnt[i]);
	}


	// sort
	int tmp;
	for (i = 0; i < max_cnt + 1; i++) {
		for (j = i + 1; j < max_cnt; j++) {
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

	printf("------------------\n");

	for (i = 0; i <= max_cnt; i++) {
		// if (arr_cnt[i] == 0)
		// 	continue;
		printf("%d\n", arr_chr[i]);
	}

	printf("------------------\n");

	for (i = 0; i <= max_cnt; i++) {
		// if (arr_cnt[i] == 0)
		// 	continue;
		printf("%d\n", arr_cnt[i]);
	}
	printf("------------------\n");

/*	for (i = 0; i <= max_cnt; i++) {
		if (arr_cnt[i] == 0)
			continue;

		printf("[%.2d] = %d;\n", arr_chr[i], arr_cnt[i]);
	}*/

	return 0;
}