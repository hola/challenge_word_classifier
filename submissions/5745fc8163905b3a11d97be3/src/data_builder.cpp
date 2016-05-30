//Data builder for JS Challenge Spring 2016: Word Classifier
//Alexey Borisov 2016, License: CC

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <windows.h>

#define BUILD_FILTER_MODE      0 // 1 - build data,  0 - check solution

#define MAX_WORD_LENGTH        256
#define WORDS_FILE_BUFFER_SIZE 7000000
#define HASH_CHUNK_SIZE        44101
#define HASH_FUNCTIONS_COUNT   8000
#define MFILE_SIZE_LIMIT       75722
#define MFILE_NAME            "D:/projects/english_words/m"
#define DICTIONARY_FILE_NAME  "D:/projects/english_words/words.txt"
#define TEST_FILE_NAME        "D:/projects/english_words/a_test.txt"

char words_file_buf[WORDS_FILE_BUFFER_SIZE];
int words_file_size = 0;
bool hash_hits[HASH_CHUNK_SIZE] = { 0 };

int hash_fn(const char * word, unsigned int len, int seed)
{
  unsigned int res = seed;
  for (unsigned int i = 0; i < len; i++)
  {
    res = (res * 101 + (word[i]) * (i + ((seed % 256) | 1)));
    res = res & 0xFFFFF; // 5 x F
  }
  return int(res);
}

bool precheck_word(const char * word, int len)
{
  if (strchr(word, '\''))
    return false;

  int score = 0;

  if (strchr(word, 'w'))
    score++;

  if (strchr(word, 'v'))
    score++;

  if (strchr(word, 'q'))
    score++;

  if (strchr(word, 'x'))
    score++;

  if (strchr(word, 'j'))
    score++;

  if (strchr(word, 'z'))
    score++;

  if (strchr(word, 'y'))
    score++;

 // if (len < 4)
 //   score *= 3;

  int inraw = 1;
  for (int i = 0; i < len; i++)
  {
    int type = (word[i] == 'a' || word[i] == 'e' || word[i] == 'o' ||
      word[i] == 'u' || word[i] == 'i' || word[i] == 'y') ? 0 : 1;
    if (type)
    {
      inraw++;
      if (inraw > 3)
        score++;
    }
    else
      inraw = 0;
  }

  if (len > 2 && word[0] == word[1])
    score += 3;

  if (len > 13)
    score++;

  if (len > 15)
    score++;

  if (len > 16)
    score++;

  return (score < 3);
}


void cut_word(char * &word, int &len)
{
  if (strstr(word, "'s") == word + (len - 2))
  {
    word[len - 2] = 0;
    len -= 2;
  }

  if (len > 2 && word[len - 1] == 's')
  {
    word[len - 1] = 0;
    len -= 1;
  }

  if (len > 3 && strstr(word + len - 3, "ing") == word + (len - 3))
  {
    word[len - 3] = 0;
    len -= 3;
  }


  if (strstr(word, "un") == word)
  {
    word += 2;
    len -= 2;
  }

}

void build_hash_misses()
{
  int total_length = 0;
  float prob = 1.0f;

  int len1 = 0;
  unsigned char buf1[500000] = { 0 };
  unsigned char buf2[500000] = { 0 };

  int prev = 0;
  int idx_delta = 0;

  for (int seed = 0; seed < HASH_FUNCTIONS_COUNT; seed++)
  {
    memset(hash_hits, 0, HASH_CHUNK_SIZE);

    char wordBuf[256] = { 0 };
    char * p = words_file_buf;
    while (p - words_file_buf < words_file_size)
    {
      char * word = wordBuf;
      int len = 0;
      while (*p && *p != '\n' && *p != '\r')
      {
        char c = *p;
        if (c >= 'A' && c <= 'Z')
          c += 'a' - 'A';
        word[len] = c;
        p++;
        len++;
      }

      word[len] = 0;
      ///

     // printf("%s ", word);
      cut_word(word, len);

      if (len > 0 && precheck_word(word, len))
      {
        int index = hash_fn(word, len, seed + 999) % HASH_CHUNK_SIZE;
        hash_hits[index] = true;
      }

      ///
      while (*p && (*p == '\n' || *p == '\r'))
        p++;
    }

    int zero_bits_count = 0;
    for (int i = 0; i < HASH_CHUNK_SIZE; i++, idx_delta++)
      if (!hash_hits[i])
      {
        if (idx_delta >= HASH_CHUNK_SIZE || idx_delta <= 0)
        {          
          buf1[len1] = (HASH_CHUNK_SIZE >> 8) & 0xFF;
          buf2[len1] = HASH_CHUNK_SIZE & 0xFF;
          len1++;
          total_length += 2;

          idx_delta -= HASH_CHUNK_SIZE;

          //printf("wrong idx_delta=%d\n", idx_delta);
          //getchar();
        }

        buf1[len1] = (idx_delta >> 8) & 0xFF;
        buf2[len1] = idx_delta & 0xFF;
        len1++;

        total_length += 2;
        zero_bits_count++;

        idx_delta = 0;
      }



    if (zero_bits_count == 0)
    {
      printf("wrong zero_bits_count=%d\n", zero_bits_count);
      getchar();
    }

    prob *= 1.0f - float(zero_bits_count) / HASH_CHUNK_SIZE;
    printf("%d: length=%d, zero_bits=%d prob=%f\n", seed, total_length, zero_bits_count, prob);

    if (total_length > MFILE_SIZE_LIMIT)
      break;
  }

  FILE * f = fopen(MFILE_NAME, "wb");
  fwrite(buf1, 1, len1, f);
  fwrite(buf2, 1, len1, f);
  printf("len1=%d", len1);
  fclose(f);

  system("C:\\Progra~1\\7-Zip\\7z a -tgzip -mx9 " MFILE_NAME ".gz " MFILE_NAME);
}

int get_file_size(const char * file_name)
{
  FILE * f = fopen(file_name, "rb");
  fseek(f, 0, SEEK_END);
  int size = ftell(f);
  fclose(f);
  return size;
}

void read_all_words(const char * file_name)
{
  words_file_size = get_file_size(file_name);
  FILE * f = fopen(file_name, "rb");
  fread(words_file_buf, 1, words_file_size, f);
  fclose(f);
}

unsigned char mfile[500000];
int mfile_length = 0;

bool is_in_dictionary(char * word, int len)
{
  cut_word(word, len);

  if (len == 0 || !precheck_word(word, len))
    return false;

  bool ok = true;
  int seed = 998;
  int idx = 0;
  int val = HASH_CHUNK_SIZE;
  int half = mfile_length / 2;
  for (int i = 0; i < half; i++)
  {
    int delta = (mfile[i] << 8) + mfile[i + half];
    val += delta;
    if (delta == HASH_CHUNK_SIZE)
      continue;

    if (val >= HASH_CHUNK_SIZE)
    {
      val -= HASH_CHUNK_SIZE;
      seed++;
      idx = hash_fn(word, len, seed) % HASH_CHUNK_SIZE;
    }

    if (val == idx)
    {
      ok = false;
      break;
    }
  }

  return ok;
}

void test_classifier(const char * file_name)
{
  mfile_length = get_file_size(MFILE_NAME);
  FILE * f = fopen(MFILE_NAME, "rb");
  fread(mfile, 1, mfile_length, f);
  fclose(f);


  int fpos = 0;
  int fneg = 0;
  int total = 0;

  f = fopen(file_name, "rt");
  while (!feof(f))
  {
    char word_buf[256] = { 0 };
    char class_buf[256] = { 0 };
    fscanf(f, "%s %s", word_buf, class_buf);
    if (*word_buf)
    {
      bool test_class = class_buf[0] == 't';
      int len = strlen(word_buf);
      if (len < 4 || (class_buf[0] != 't' && class_buf[0] != 'f'))
      {
        printf("error reading test word\n");
      }
      else
      {
        word_buf[len - 2] = 0;
        bool cl = is_in_dictionary(word_buf + 1, len - 3);

        total++;
        if (cl != test_class)
          if (cl)
          {
            fpos++;
            //printf("%s\n", word_buf + 1);
          }
          else
            fneg++;
      }

      if (total && total % 1000 == 0)
        printf("on %d: fpos=%d, fneg=%d, fsum=%d, rate=%f\n",
          total, fpos, fneg, fpos + fneg, 1.0 - float(fpos + fneg) / total);
    }
  }
  fclose(f);
}


int main()
{
#if BUILD_FILTER_MODE == 1
  read_all_words(DICTIONARY_FILE_NAME);
  build_hash_misses();
#else
  test_classifier(TEST_FILE_NAME);
#endif
  getchar();
  return 0;
}

