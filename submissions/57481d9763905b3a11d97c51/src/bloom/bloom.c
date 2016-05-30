#include <stdlib.h>
#include <stdio.h>
#include <string.h>
#include <stdarg.h>
#include <time.h>
#include <unistd.h>


/* config options */
// 31..37

int MULTIPLIER_BYTE = 33;
int MULTIPLIER_BIT 	= 34;
int MAX_DB_SIZE		= 74383 + 341;
int MAX_JS_SIZE		= 341;
int FILTER_SIZE		= 0;
int FILTER_SIZE_MAX	= 100000;

#define WORD_BUF_SIZE	150
#define IF_CNT 			if (len < 15)
#define ELSE_CNT 		else result = 0; // in_rnd(len);

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
int is_grep(char *, char *);
int is_grep_all(char *, int);

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

	FILTER_SIZE = MAX_DB_SIZE - MAX_JS_SIZE;

	init_filter(filter);

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
			FILTER_SIZE = MAX_DB_SIZE - MAX_JS_SIZE;
		}

		if (!strcmp(argv[i], "-max_js")) {
			MAX_JS_SIZE = atoi(argv[i + 1]);
			FILTER_SIZE = MAX_DB_SIZE - MAX_JS_SIZE;
		}

		if (!strcmp(argv[i], "-filter_size")) {
			FILTER_SIZE = atoi(argv[i + 1]);
		}

		if (FILTER_SIZE <= 0) {
			err("FILTER_SIZE must be > 0\n");
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

	return 0;
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
		err("[e] %s: can't open file \"%s\"\n", __FUNCTION__, filename);
	}

	// long long index = 0;

	while (fgets(word, WORD_BUF_SIZE, (FILE *) fp)) {
		int len = strlen(word);

		if (len == WORD_BUF_SIZE - 1) {
			err("[e] WORD_BUF_SIZE is small\n");
		}

		word[strcspn(word, "\n")] = 0;
		len--;


		IF_CNT {
			if (!is_grep_all(word, len))
				insert_word(filter, word);
		}

		// index++;
		// if (index % 100 == 0) {
		// 	printf("%lld\n", index);
		// }
	}

	fclose(fp);
}

void insert_word(unsigned char filter[], char *word)
{
	// printf("insert: %s\n", word);

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
		err("[e] %s: can't open file \"%s\"\n", __FUNCTION__, file_in);
	}

	if (!fr) {
		err("[e] %s: can't open file \"%s\"\n", __FUNCTION__, file_res);
	}

	// long long int index = 0;

	while (fgets(word, WORD_BUF_SIZE, (FILE *) fi)) {
		int len = strlen(word);

		if (len == WORD_BUF_SIZE - 1) {
			err("[e] WORD_BUF_SIZE is small\n");
		}

		word[strcspn(word, "\n")] = 0;
		len--;

		int result = 0;

		if (is_corrcet_len(len)) {

			if (word[0] == '\'' || word[len - 1] == '\'') {
				goto out;
			}

			if (len == 1) {
				result = 1;
				goto out;
			}

			if (is_grep_all(word, len)) {
				goto out;
			}

			IF_CNT {
				result = in_dict(filter, word);
				goto out;
			}
			ELSE_CNT
		}

	out:

		if (result) {
			fprintf(fr, "\"%s\": \"true\"\n", word);
		} else {
			fprintf(fr, "\"%s\": \"false\"\n", word);
		}

		// index++;
		// if (index % 1000 == 0) {
		// 	printf("%lld\n", index);
		// 	fflush(stdout);
		// }
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
		0.2355889724,
		0.5303571429,
		0.4332809889,
		0.4062591666,
		0.470413852,
		0.543142033,
		0.5907591493,
		0.6215456425,
		0.6315122759,
		0.6041853963,
		0.5763330962,
		0.5384971024,
		0.4891409238,
		0.4333298623,
		0.368964808,
		0.3017000108,
		0.2260091693,
		0.1597245748,
		0.1080629006,
		0.0596169174,
		0.0356754664,
		0.0188164096,
		0.00926039,
		0.0060242354,
		0.0030079087,
		0.0006392747,
		0.0009884889,
		0.0007864164,
		0.0018979834,
		0.0007696138,
		0.002919708,
		0.0020509315,
		0.0015308075,
		0.0013565453
	};

	double r = 0;
	int cnt = (int) (sizeof(arr) / sizeof(double));

	if (len < cnt)
		r = arr[len];

	double rnd = ((double) rand() / (double) RAND_MAX);
	//printf("[%e vs %e] = %d\n", r, rnd, (r > rnd));

	return (int) (r > rnd);
}

void save2bin_file(unsigned char filter[], char *filename) {
	FILE *fp = fopen(filename, "wb");
	int i;

	if (!fp) {
		err("[e] %s: can't open file \"%s\"\n", __FUNCTION__, filename);
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

int is_grep(char *word, char *ereg) {
	FILE *cmd;
	char result[255];
	char sh[255];
	int rez = 0;

	snprintf(sh, sizeof(sh), "echo \"%s\" | grep -E \"%s\" | wc -l", word, ereg);
	// printf("%s\n", sh);
	cmd = popen(sh, "r");

	if (cmd == NULL) {
		err("sh");
	}

	if (fgets(result, sizeof(result), cmd)) {
		rez = atoi(result);
	}

	pclose(cmd);

	return rez;
}

int is_grep_all(char *word, int len) {
	// printf("%s: ", word);

	if (len == 1) {
		return 1;
	}

	char *str[] = {
		// <= 1
		// "''", "'j", "jq", "jx", "jz", "'q", "qj", "qx", "qz", "vq", "'x", "xj", "'z", "zx", "wq", "wx", "'y", "gx", "hx", "px", "zj", "vj", "qg", "qy", "kx", "qh", "xz", "'w", "qf", "qv", "qp", "vb", "qc", "vw", "fq", "jv", "'g", "qk", "vx", "cx", "kz", "'k", "gq", "kq", "xk", "qn", "fx", "'b", "qb", "jg", "pq", "qw", "'u", "sx", "'p", "qt", "jb", "qd", "fv", "'f", "qm", "cj", "jw", "bx", "vf", "tx", "fz", "jf", "ql", "qo", "qq", "'h", "dx", "zq", "mx", "vz", "pz", "yq", "wj", "'m", "qr", "jm", "jt", "mq", "bq", "'v", "jj", "jl", "zf", "'r", "qe", "xg", "bz", "jh", "vh", "xq", "jp", "vp", "'o", "'n", "xx", "xr", "fj", "'c", "jk", "'i"
		// <= 2
		// "''", "'j", "jq", "jx", "jz", "'q", "qj", "qx", "qz", "vq", "'x", "xj", "'z", "zx", "wq", "wx", "'y", "gx", "hx", "px", "zj", "vj", "qg", "qy", "kx", "qh", "xz", "'w", "qf", "qv", "qp", "vb", "qc", "vw", "fq", "jv", "'g", "qk", "vx", "cx", "kz", "'k", "gq", "kq", "xk", "qn", "fx", "'b", "qb", "jg", "pq", "qw", "'u", "sx", "'p", "qt", "jb", "qd", "fv", "'f", "qm", "cj", "jw", "bx", "vf", "tx", "fz", "jf", "ql", "qo", "qq", "'h", "dx", "zq", "mx", "vz", "pz", "yq", "wj", "'m", "qr", "jm", "jt", "mq", "bq", "'v", "jj", "jl", "zf", "'r", "qe", "xg", "bz", "jh", "vh", "xq", "jp", "vp", "'o", "'n", "xx", "xr", "fj", "'c", "jk", "'i", "lx", "tq", "jy", "'e", "vm", "vg", "jc", "'l", "xv", "wv", "zg", "dq", "q'", "qs", "yj", "hq", "xd", "mz", "xn", "jd", "yy", "js", "cv", "jr", "j'", "hj", "wz", "zp", "rx", "lq", "gj", "gv", "jn", "vk", "gz", "vc", "mj", "'t", "zv", "zr", "vt", "vd", "pj", "pv"
		// <= 2.76
		// "''", "'j", "jq", "jx", "jz", "'q", "qj", "qx", "qz", "vq", "'x", "xj", "'z", "zx", "wq", "wx", "'y", "gx", "hx", "px", "zj", "vj", "qg", "qy", "kx", "qh", "xz", "'w", "qf", "qv", "qp", "vb", "qc", "vw", "fq", "jv", "'g", "qk", "vx", "cx", "kz", "'k", "gq", "kq", "xk", "qn", "fx", "'b", "qb", "jg", "pq", "qw", "'u", "sx", "'p", "qt", "jb", "qd", "fv", "'f", "qm", "cj", "jw", "bx", "vf", "tx", "fz", "jf", "ql", "qo", "qq", "'h", "dx", "zq", "mx", "vz", "pz", "yq", "wj", "'m", "qr", "jm", "jt", "mq", "bq", "'v", "jj", "jl", "zf", "'r", "qe", "xg", "bz", "jh", "vh", "xq", "jp", "vp", "'o", "'n", "xx", "xr", "fj", "'c", "jk", "'i", "lx", "tq", "jy", "'e", "vm", "vg", "jc", "'l", "xv", "wv", "zg", "dq", "q'", "qs", "yj", "hq", "xd", "mz", "xn", "jd", "yy", "js", "cv", "jr", "j'", "hj", "wz", "zp", "rx", "lq", "gj", "gv", "jn", "vk", "gz", "vc", "mj", "'t", "zv", "zr", "vt", "vd", "pj", "pv", "hz", "'d", "fk", "cw", "zc", "zd", "zn", "qi", "zt", "lj", "fg", "xw", "zw"
		// <= 3
		// "''", "'j", "jq", "jx", "jz", "'q", "qj", "qx", "qz", "vq", "'x", "xj", "'z", "zx", "wq", "wx", "'y", "gx", "hx", "px", "zj", "vj", "qg", "qy", "kx", "qh", "xz", "'w", "qf", "qv", "qp", "vb", "qc", "vw", "fq", "jv", "'g", "qk", "vx", "cx", "kz", "'k", "gq", "kq", "xk", "qn", "fx", "'b", "qb", "jg", "pq", "qw", "'u", "sx", "'p", "qt", "jb", "qd", "fv", "'f", "qm", "cj", "jw", "bx", "vf", "tx", "fz", "jf", "ql", "qo", "qq", "'h", "dx", "zq", "mx", "vz", "pz", "yq", "wj", "'m", "qr", "jm", "jt", "mq", "bq", "'v", "jj", "jl", "zf", "'r", "qe", "xg", "bz", "jh", "vh", "xq", "jp", "vp", "'o", "'n", "xx", "xr", "fj", "'c", "jk", "'i", "lx", "tq", "jy", "'e", "vm", "vg", "jc", "'l", "xv", "wv", "zg", "dq", "q'", "qs", "yj", "hq", "xd", "mz", "xn", "jd", "yy", "js", "cv", "jr", "j'", "hj", "wz", "zp", "rx", "lq", "gj", "gv", "jn", "vk", "gz", "vc", "mj", "'t"//, "zv", "zr"//, "vt", "vd", "pj", "pv", "hz"//, "'d", "fk", "cw", "zc", "zd", "zn", "qi", "zt", "lj", "fg", "xw", "zw", "zs", "kj", "'a", "vn", "fw"

		//74.26
		// "''", "'j", "jq", "jx", "jz", "'q", "qj", "qx", "qz", "vq", "'x", "xj", "'z", "zx", "wq", "'y", "wx", "gx", "qy", "hx", "zj", "px", "kx", "vj", "qg", "qh", "xz", "qf", "'g", "qp", "'u", "qv", "vb", "'p", "'w", "vw", "qc", "fq", "jv", "'k", "qk", "vx", "cx", "kz", "gq", "kq", "xk", "qn", "qo", "fx", "qb", "jg", "'b", "yq", "qw", "pq", "sx", "qt", "jb", "qd", "fv", "jw", "cj", "qm", "bx", "vf", "fz", "jf", "tx", "qe", "'o", "ql", "qq", "dx", "'c", "'f", "zq", "'h", "pz", "vz", "mx", "'m", "wj", "jm", "qr", "jt", "bq", "mq", "jj", "jy", "jl", "'i", "zf", "bz", "xg", "'n"
		"''", "'j", "jq", "jx", "jz", "'q", "qj", "qx", "qz", "vq", "'x", "xj", "'z", "zx", "'y", "wq", "wx", "qy", "gx", "hx", "zj", "px", "kx", "vj", "qg", "qh", "qf", "'u", "xz", "'g", "qp", "qv", "qk", "vb", "'p", "'w", "fq", "vw", "qc", "'k", "jv", "qo", "cx", "vx", "kz", "gq", "kq", "xk", "qn", "yq", "qb", "fx", "'b", "jg", "qw", "pq", "qe", "qt", "sx", "jb", "'o", "qd", "jf", "fv", "cj", "qm", "jw", "ql", "bx", "vf", "dx", "fz", "tx", "qq", "'c", "'f", "'h", "zq", "vz", "qr", "'m", "'i", "pz", "mx", "wj", "jy", "jm", "jt", "bq", "mq", "jl", "yy", "jj", "yj", "zf", "'n"

		//"''", "'j", "jq", "jx", "jz", "'q", "qj", "qx", "qz", "vq", "'x", "xj", "'z", "zx", "wq", "wx", "'y", "gx", "hx", "px", "zj", "vj", "qg", "qy", "kx", "qh", "xz", "'w", "qf", "qv", "qp", "vb", "qc", "vw", "fq", "jv", "'g", "qk", "vx", "cx", "kz", "'k", "gq", "kq", "xk", "qn", "fx", "'b", "qb", "jg", "pq", "qw", "'u", "sx", "'p", "qt", "jb", "qd", "fv", "'f", "qm", "cj", "jw", "bx", "vf", "tx", "fz", "jf", "ql", "qo", "qq", "'h", "dx", "zq", "mx", "vz", "pz", "yq", "wj", "'m", "qr", "jm", "jt", "mq", "bq", "'v", "jj", "jl", "zf", "'r", "qe", "xg", "bz", "jh", "vh", "xq", "jp", "vp", "'o", "'n", "xx", "xr", "fj", "'c", "jk", "'i", "lx", "tq", "jy", "'e", "vm", "vg", "jc", "'l", "xv", "wv", "zg", "dq", "q'", "qs", "yj", "hq", "xd", "mz", "xn", "jd", "yy", "js", "cv", "jr", "j'", "hj", "wz", "zp", "rx", "lq", "gj", "gv", "jn", "vk", "gz", "vc", "mj", "'t", "zv", "zr", "vt", "vd", "pj", "pv", "hz", "'d", "fk", "cw", "zc", "zd", "zn", "qi", "zt", "lj", "fg", "xw", "zw", "zs", "kj", "'a", "vn", "fw", "fp", "cf", "bk", "fh",// "zk", "xb",// "xm",// "xf", "zm",// "mk",// "kg", "fb", "cb", "fd"//, "cg", "wg", "gk", "qa", "vv", "zb", "dk", "xl", "fc", "sj",// "mg", "fm", "gc", "uw", "pg", "cp", "uq", "bg"//, "tj", "cz", "fn", "sz", "vl",// "ww", "zh", "pk", "hv",// "lz", "dz", "uu",// "kc", "gp", "xs",// "hg"//, "kv"//, "kd"//, "wc", "mv", "mh"//, "bw", "tk", "nx", "bv", "pd", "cd", "mw", "uj", "cm", "wp", "hk", "hh", "v'", "vs", "bf", "yk", "gf", "yz", "mt", "md", "wf", "kp", "tv", "bp", "vr", "xh"
	};
	int size = (int) (sizeof(str) / sizeof(char *));
	int i;
	char *ret;

	// strstr
	for (i = 0; i < size; i++) {
		ret = strstr(word, str[i]);

		if (ret != NULL)
			return 1;
	}

	// grep first
	char *first[] = {
		// <= 1
		// "fk", "lk", "lq", "rz", "uo", "uq", "vk", "wz", "yj", "yk", "yx", "yz", "zc", "zv", "ck", "v'", "hk", "gv", "yy", "rk", "nx", "p'", "c'", "tq", "zd", "gg", "zp", "cq", "zg", "r'", "s'", "nq", "q'", "k'", "a'"
		// <= 2
		// "fk", "lk", "rz", "uo", "uq", "yk", "yx", "yz", "zc", "ck", "v'", "hk", "rk", "nx", "p'", "c'", "zd", "gg", "cq", "r'", "s'", "nq", "k'", "a'", "nz", "e'", "z'", "u'", "m'", "g'", "f'", "zk", "rq", "xw", "xb", "x'", "h'", "w'", "xp", "zt", "zm", "b'", "wn", "yh", "xl", "gk", "y'", "lz", "xs", "vv", "hz", "xc", "t'", "wk"
		// <= 2.76
		// "lk", "rz", "uo", "uq", "yk", "yx", "yz", "ck", "v'", "hk", "rk", "nx", "p'", "c'", "gg", "cq", "r'", "s'", "nq", "k'", "a'", "nz", "e'", "z'", "u'", "m'", "g'", "f'", "zk", "rq", "xb", "x'", "h'", "w'", "xp", "zm", "b'", "wn", "yh", "xl", "gk", "y'", "lz", "xs", "vv", "xc", "t'", "wk", "wd", "nv", "xf", "hn", "wg", "rj", "rv", "kf", "yw"
		// <= 3
		// "lk", "rz", "uo", "uq", "yk", "yx", "yz", "ck", "v'", "hk", "rk", "nx", "p'", "c'", "gg", "cq", "r'", "s'", "nq", "k'", "a'", "nz", "e'", "z'", "u'", "m'", "g'", "f'", "zk", "rq", "xb", "x'", "h'", "w'", "xp", "zm", "b'", "wn", "yh", "xl", "gk", "y'"//, "lz", "xs",// "vv", "xc", "t'", "wk", "wd", //"nv", "xf", "hn", "wg", "rj", "rv", "kf", "yw", "hh", "n'", "uy", "nt", "rr"

		//74.26
		// "fk", "lk", "lq", "rz", "uo", "uq", "vk", "wz", "yj", "yk", "yx", "yz", "zc", "zv", "ck", "rk", "yy", "hk", "gv", "v'", "nx", "gg", "xq", "tq", "zd", "zp", "cq", "p'", "zg", "nq", "nz", "wn", "q'", "c'"
		"fk", "lk", "lq", "rz", "uo", "uq", "vk", "wz", "xg", "yk", "yx", "yz", "zc", "zv", "ck", "rk", "zp", "v'", "hk", "gv", "gg", "nx", "xw", "tq", "wn", "zd", "p'", "xq", "cq", "zg", "nq", "nz", "ff", "q'", "c'", "kf", "pj"
	};

	size = (int) (sizeof(first) / sizeof(char *));

	for (i = 0; i < size; i++) {
		ret = strstr(word, first[i]);

		if (ret == word)
			return 1;
	}


	// grep last
	char *last[] = {
		// <= 1
		// "'e", "gj", "gz", "tq", "vk", "wz", "xh", "yj", "yw", "zp", "zv", "zw", "dw", "zm", "yv", "hj", "pj", "tj", "hk", "xw", "mz", "yf", "zc", "zg", "xf", "'l", "xb", "yh", "kl", "vv"
		// <= 2
		// "xh", "yw", "zw", "dw", "zm", "yv", "tj", "hk", "xw", "yf", "zc", "xf", "xb", "yh", "kl", "vv", "gw", "kp", "lh", "kd", "xm", "kb", "uq", "uj", "zb", "fk", "gf", "nq", "zh", "kf", "kv", "kc", "dk", "km", "ej", "oj", "zk", "zs", "kj", "xp"
		// <= 2.76
		// "xh", "yw", "dw", "zm", "yv", "tj", "hk", "yf", "xf", "xb", "yh", "kl", "vv", "gw", "kp", "lh", "kd", "xm", "kb", "uq", "uj", "zb", "gf", "nq", "zh", "kf", "kv", "kc", "dk", "km", "ej", "oj", "zk", "zs", "kj", "xp", "xu", "xl", "vl", "fh", "bk", "tw", "yb", "hw", "sq", "hh", "hv", "kk", "kn", "kw", "'a", "tk", "rq", "zl"
		// <= 3
		// "xh", "yw", "dw", "zm", "yv", "tj", "hk", "yf", "xf", "xb", "yh", "kl", "vv", "gw", "kp", "lh", "kd", "xm", "kb", "uq", "uj", "zb", "gf", "nq", "zh", "kf", "kv", "kc", "dk", "km", "ej", "oj", "zk", "xp", "xu", "xl", "vl", "fh", "bk", "tw", "yb", "hw", "sq", "hh", "hv", "kk", "kn", "kw", "tk", "rq", "zl", "qa", "dj", "iy", "pk", "bj", "pw"

		// 74.26
		// "'e", "gj", "gz", "jh", "'r", "tq", "'v", "vk", "wz", "xh", "yj", "yw", "zp", "zv", "zw", "dw", "zm", "yv", "hj", "pj", "tj", "yf", "hk", "mz", "xw", "zc", "zg", "xf", "xq", "yh", "fj", "xb", "'l", "jp", "uj", "kl", "uq", "vv", "xv", "lh", "gw", "xm", "zb", "kd", "jr", "kp", "gf", "lq", "kb", "fk"
		"'e", "gj", "gz", "jh", "'r", "tq", "'v", "vk", "wz", "xg", "xh", "yw", "zp", "zv", "zw", "hk", "dw", "zm", "yv", "hj", "pj", "yf", "tj", "mz", "xw", "zc", "yh", "zg", "xf", "xq", "fj", "uq", "kl", "uj", "'l", "xb", "jp", "vv", "lh", "xm", "gw", "xv", "ej", "zb", "kd", "lq", "gf", "jr", "kp", "fk", "kb"
	};

	size = (int) (sizeof(last) / sizeof(char *));

	for (i = 0; i < size; i++) {
		ret = strstr(word, last[i]);

		if (ret == (word + len - 2))
			return 1;
	}


/*	if (is_grep(word, "[a-z]+'s[a-z]+")) {
		return 1;
	}

	if (is_grep(word, "'[a-z]+'")) {
		return 1;
	}

	if (is_grep(word, "[^aeiouy]{5,}")) {
		return 1;
	}*/

	return 0;
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
