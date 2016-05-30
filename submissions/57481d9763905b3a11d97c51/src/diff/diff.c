#include <stdio.h>
#include <string.h>



int main(int argc, char *argv[]) {

	FILE *f1 = fopen(argv[1], "r");
	FILE *f2 = fopen(argv[2], "r");

	char word1[64], word2[64];

	if (!f1 || !f2) {
		printf("usage: %s file1.txt file2.txt\n", argv[0]);
		return -1;
	}

	while (fgets(word1, sizeof(word1), (FILE *) f1)) {
		int flag = 0;
		fseek(f2, 0, SEEK_SET);

		while (fgets(word2, sizeof(word2), (FILE *) f2)) {
			if (strstr(word1, word2) > 0) {
				flag = 1;
				break;
			}
		}

		if (!flag) {
			printf("%s", word1);
		}
	}

	fclose(f1);
	fclose(f2);

	return 0;
}