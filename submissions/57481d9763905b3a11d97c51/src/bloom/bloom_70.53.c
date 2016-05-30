#include <stdlib.h>
#include <stdio.h>
#include <string.h>
#include <stdarg.h>
#include <time.h>


/* config options */
// 35:34 70.53394543552517726000 (74815+328)
// 31..37

int MULTIPLIER_BYTE = 35;
int MULTIPLIER_BIT 	= 34;
int MAX_DB_SIZE		= 74815 + 328;
int MAX_JS_SIZE		= 328;
int FILTER_SIZE		= 0;
int FILTER_SIZE_MAX	= 100000;

#define WORD_BUF_SIZE		150
#define IF_CNT	if (len <= 13)
#define ELSE_CNT else result = 0;//in_rnd(len);

/* helper functions */
void err(char *msg, ...);
void init_filter(unsigned char []);
void load_words(unsigned char [], char *);
void insert_word(unsigned char [], char *);
void testing_words(unsigned char [], char *, char *);
int in_dict(unsigned char [], char *);
int in_rnd(int);
void save2bin_file(unsigned char filter[], char *);
int is_corrcet_len(unsigned int);
int is_correct_quote(char []);

unsigned int hash_byte(char *);
unsigned int hash_bit(char *);
void set_bit(unsigned char *byte, int bit);
int get_bit(unsigned char byte, int bit);
void show_bits(unsigned char[]);


int main(int argc, char *argv[])
{
	srand((unsigned)time(NULL));
	unsigned char filter[FILTER_SIZE_MAX];

	if (argc == 1)
		err("usage:\n"
		"  ./prog -hash some_word\n"
		"  ./prog -m_byte 3 -m_bit 12 -hash some_word\n"
		"  ./prog -d_file dict.txt -tr_files test.txt result.txt\n"
		"  ./prog -d_file dict.txt -tr_files test.txt result.txt -b_file data.bin\n"
		"  ./prog -show_options\n"
		);

	init_filter(filter);
	FILTER_SIZE = MAX_DB_SIZE - MAX_JS_SIZE;

	// set_bit(&filter[1], 3);
	// save2bin_file(filter, "data.bin");
	// return 0;

	int i;
	for (i = 0; i < argc; i++) {
		if (!strcmp(argv[i], "-m_byte")) {
			MULTIPLIER_BYTE = atoi(argv[i + 1]);
		}

		if (!strcmp(argv[i], "-m_bit")) {
			MULTIPLIER_BIT = atoi(argv[i + 1]);
		}

		if (!strcmp(argv[i], "-max_db")) {
			MAX_DB_SIZE = atoi(argv[i + 1]);
		}

		if (!strcmp(argv[i], "-max_js")) {
			MAX_JS_SIZE = atoi(argv[i + 1]);
		}

		if (!strcmp(argv[i], "-filter_size")) {
			FILTER_SIZE = atoi(argv[i + 1]);
		}

		if (!strcmp(argv[i], "-hash")) {
			unsigned int byte = hash_byte(argv[i + 1]);
			unsigned int bit = hash_bit(argv[i + 1]);
			printf("%s:%d:%d\n", argv[i + 1], byte, bit);
		}

		// dictionary file
		if (!strcmp(argv[i], "-d_file")) {
			load_words(filter, argv[i + 1]);
		}

		// test file, result file
		if (!strcmp(argv[i], "-tr_files")) {
			testing_words(filter, argv[i + 1], argv[i + 2]);
		}

		// binary file
		if (!strcmp(argv[i], "-b_file")) {
			save2bin_file(filter, argv[i + 1]);
		}

		if (!strcmp(argv[i], "-show_options")) {
			printf("MAX_DB_SIZE     = %d;\n", MAX_DB_SIZE);
			printf("MAX_JS_SIZE     = %d;\n", MAX_JS_SIZE);
			printf("FILTER_SIZE     = %d;\n", FILTER_SIZE);
			printf("MULTIPLIER_BYTE = %d;\n", MULTIPLIER_BYTE);
			printf("MULTIPLIER_BIT  = %d;\n", MULTIPLIER_BIT);
		}
	}

}

void err(char *msg, ...)
{
	va_list args;
	va_start(args, msg);
	vfprintf(stderr, msg, args);
	va_end(args);
	exit(-1);
}

void init_filter(unsigned char filter[])
{
	unsigned int i;

	for (i = 0; i < FILTER_SIZE_MAX; i++) {
		filter[i] = 0;
	}
}

void load_words(unsigned char filter[], char *filename)
{
	FILE *fp = fopen(filename, "r");
	char word[WORD_BUF_SIZE + 1];

	if (!fp) {
		err("[e] can't open file \"%s\"\n", filename);
	}

	while (fgets(word, WORD_BUF_SIZE, (FILE *) fp)) {
		int len = strlen(word);

		if (len == WORD_BUF_SIZE - 1) {
			err("[e] WORD_BUF_SIZE is small\n");
		}

		word[strcspn(word, "\n")] = 0;
		len--;

		IF_CNT
			insert_word(filter, word);
	}

	fclose(fp);
}

void insert_word(unsigned char filter[], char *word)
{
	if (!word) {
		err("[e] word is NULL");
	}

	unsigned int byte = hash_byte(word);
	unsigned int bit = hash_bit(word);

	set_bit(&filter[byte], bit);
}

void testing_words(unsigned char filter[], char *file_in, char *file_res)
{
	FILE *fi = fopen(file_in, "r");
	FILE *fr = fopen(file_res, "w");

	char word[WORD_BUF_SIZE + 1];

	if (!fi) {
		err("[e] can't open file \"%s\"\n", file_in);
	}

	if (!fr) {
		err("[e] can't open file \"%s\"\n", file_res);
	}

	while (fgets(word, WORD_BUF_SIZE, (FILE *) fi)) {
		int len = strlen(word);

		if (len == WORD_BUF_SIZE - 1) {
			err("[e] WORD_BUF_SIZE is small\n");
		}

		word[strcspn(word, "\n")] = 0;
		len--;

		int result = 0;
		if (is_corrcet_len(len) && is_correct_quote(word)) {
			if (len == 1)
				result = 1;
			else {
				IF_CNT  
					result = in_dict(filter, word);
				ELSE_CNT
			}
		}

		if (result) {
			fprintf(fr, "\"%s\": \"true\"\n", word);
		} else {
			fprintf(fr, "\"%s\": \"false\"\n", word);
		}
	}

	fclose(fi);
	fclose(fr);
}

int in_dict(unsigned char filter[], char *word)
{
	if (!word) {
		err("[e] word is NULL");
	}

	unsigned int byte = hash_byte(word);
	unsigned int bit = hash_bit(word);

	return get_bit(filter[byte], bit);
}

int in_rnd(int len) {
	double arr[] = {
		0,
		1,
		0.5,
		0.2345132743,
		0.5308882397,
		0,4360087152,
		0.4059558277,
		0.4684708311,
		0.543268067,
		0.5904200038,
		0.6215872352,
		0.6322502983,
		0.604238472,
		0.5769336896,
		0.5383414692,
		0.4893367481,
		0.4333066432,
		0.3668566002,
		0.3015425431,
		0.2258818008,
		0.1601499806,
		0.1084326757,
		0.0591312758,
		0.0340435631,
		0.0189605449
	};

	double r = 0;
	int cnt = 25;//(int) (sizeof(arr) / sizeof(double));

	if (len < cnt)
		r = arr[len];

	double rnd = ((double) rand() / (double) RAND_MAX);
	//printf("[%e vs %e] = %d\n", r, rnd, (r > rnd));

	return (int) (r < rnd);
}

void save2bin_file(unsigned char filter[], char *filename) {
	FILE *fp = fopen(filename, "wb");
	int i;

	if (!fp) {
		err("can't open file \"%s\"\n", filename);
	}

	for (i = 0; i < FILTER_SIZE; i++) {
		fprintf(fp, "%c", filter[i]);
	}

	fclose(fp);
}

int is_corrcet_len(unsigned int len) {
	if (len <= 34 || len == 45 || len == 58 || len == 60) {
		return 1;
	}

	return 0;
}

int is_correct_quote(char word[]) {
	int len = strlen(word);
	if (word[0] == '\'' || word[len - 1] == '\'')
		return 0;

	return 1;
}

unsigned int hash_byte(char *str)
{
	unsigned int h;
	unsigned char *p;

	h = 0;
	for (p = (unsigned char *) str; *p != '\0'; p++) {
		//printf("%c=%d, h = %d\n", *p, *p, h);
		h = MULTIPLIER_BYTE * h + *p;
		h %= FILTER_SIZE;
	}

	return h;
}

unsigned int hash_bit(char *str)
{
	unsigned int h;
	unsigned char *p;

	h = 0;
	for (p = (unsigned char *) str; *p != '\0'; p++) {
		h = MULTIPLIER_BIT * h + *p;
		h %= 8;
	}

	return h;
}

void set_bit(unsigned char *byte, int bit)
{
	*byte |= (1 << bit);

	return;
}

int get_bit(unsigned char byte, int bit)
{
	byte &= (1 << bit);

	return byte ? 1 : 0;
}

void show_bits(unsigned char filter[]) {
	unsigned int i;

	for (i = 0; i < FILTER_SIZE; i++)
		printf("0x%02x\n", filter[i]);
}
