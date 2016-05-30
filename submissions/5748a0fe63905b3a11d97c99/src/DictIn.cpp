#define _CRT_SECURE_NO_WARNINGS
#include <time.h>
#include <conio.h>
#include <assert.h>
#include <fstream>
#include <iostream>
#include <iomanip>
#include <map>
#include <unordered_map>
#include <set>
#include <vector>
#include <string>

#include "Hashes.h"
#include "BitField.h"
#include "Grams.h"

#define min(a, b) ((a) < (b) ? (a) : (b))
#define max(a, b) ((a) > (b) ? (a) : (b))
#define clamp(a, b, c) min(max(a, b), c)


//#define TEST_MAIN_BLOOM_SIZE
//#define TEST_HASH_SEEDS
//#define TEST_GRAMS_COUNT
//#define TEST_CONS_GRAMS_COUNT
//#define TEST_PREFIXES
//#define TEST_POSTFIXES

//#define SHOW_DEBUG_COUNTERS
#define SAVE_FAIL_STATS
#define BUILD_THRESHOLD_TABLE
const int thresholdCount = 10;

#ifdef TEST_HASH_SEEDS
int hashSeed = 0;
#endif

#ifdef TEST_PREFIXES
int testedPrefix = -1;
#endif

#ifdef TEST_POSTFIXES
int testedPostfix = -1;
#endif

#ifdef SHOW_DEBUG_COUNTERS
int c0 = 0;
int c1 = 0;
int c2 = 0;
int c3 = 0;
int c4 = 0;
int c5 = 0;
int c6 = 0;
int c7 = 0;
int c8 = 0;
int c9 = 0;
#endif

#define MAX_WORD_LEN 64

int appArgc;
char ** appArgv;
clock_t logIntervalMs = 200;

const int useMainBloomTest = 1;
const int useGramTest = 1;
const int useMultiVovsTest = 0;
const int useMultiConsTest = 1;
const int useMorphStatsTest = 1;
const int usePrefixCutOff = 1;
const int usePostfixCutOff = 1;

const int maxValidWordLength = 16;
const int gramLength = 2;
int maxGramSamplesCount = 615;
const int maxVowelsCount = 2;
int maxVowelSamplesCount = 200;
const int maxConsonantsCount = 2;
int maxConsonantSamplesCount = 1400;

const int minMorphemLength = 1;
const int maxMorphemLength = 3;
const int maxHashCount = 120;

unsigned int mainBloomBytesCount = 65074;
unsigned int mainBloomBitsCount = mainBloomBytesCount * 8;

const int maxDictSize = 1000000;
const int maxSamplesSize = 10000000;

static const char * vowels = "aeouiy";
const int maxPrefixLength = 7;
const int maxPostfixLength = 7;

/*
static const char * prefixes[] =
{
  "after",
  "air",
  "ante",
  "anti",
  "arch",
  "back",
  "be",
  "blood",
  "blue",
  "chemo",
  //"contra",
  "counter",
  "cross",
  "demi",
  "dis",
  "disen",
  "down",
  "en",
  "equi",
  "fire",
  "fore",
  "free",
  "green",
  "head",
  "high",
  "home",
  "horse",
  "house",
  //"immuno",
  "in",
  "infra",
  "inter",
  "intra",
  "land",
  "meso",
  "mid",
  "milli",
  "mis",
  "multi",
  "night",
  "non",
  "out",
  "over",
  "philo",
  "photo",
  "post",
  "pre",
  "predis",
  "proto",
  "pseudo",
  "quadri",
  "re",
  "school",
  "semi",
  "side",
  "snow",
  "stock",
  "stone",
  "sub",
  "sulpho",
  "super",
  "supra",
  "thermo",
  "trans",
  "ultra",
  "un",
  //"uncon",
  "under",
  "undis",
  "up",
  //"white",
  "wood",
  "work",
};

static const char * postfixes[] =
{
  "er",
  "istic",
  //"d",
  "head",
  "ed",
  "headed",
  "weed",
  "fied",
  "ened",
  "hearted",
  "field",
  "land",
  "hood",
  "wood",
  "board",
  "ward",
  "bird",
  "ae",
  "dae",
  "age",
  "fishe",
  "erie",
  "berrie",
  "itie",
  "like",
  "dale",
  "able",
  //"isable",
  "ville",
  "sville",
  "some",
  "stone",
  "shire",
  "se",
  "wise",
  "nesse",
  "dnesse",
  //"inesse",
  //"linesse",
  "house",
  "esque",
  "proof",
  "ing",
  "making",
  "ling",
  //"ening",
  //"ising",
  "sburg",
  "graph",
  "ish",
  "fish",
  "back",
  "work",
  "al",
  "logical",
  "ional",
  "ful",
  "dom",
  "ism",
  //"ianism",
  "man",
  "woman",
  //"sman",
  "men",
  "women",
  //"smen",
  "town",
  "boro",
  //"hip",
  "ship",
  "manship",
  "monger",
  "ier",
  //"lier",
  "maker",
  "flower",
  "as",
  //"ias",
  "woods",
  //"nces",
  "ages",
  //"ncies",
  //"ties",
  "les",
  "nes",
  "ednes",
  "ablenes",
  //"ivenes",
  "ingnes",
  //"ishnes",
  "fulnes",
  //"lessnes",
  //"ures",
  "tes",
  "ites",
  //"ngs",
  "is",
  //"als",
  "ons",
  "ers",
  "lers",
  //"ters",
  //"ors",
  "ss",
  "ess",
  //"us",
  //"ous",
  //"ious",
  "let",
  "craft",
  "ant",
  "ment",
  "root",
  "wort",
  "iest",
  //"liest",
  "tou",
  "logy",
  "ly",
  "edly",
  //"ively",
  //"atively",
  "ingly",
  //"ishly",
  "ily",
  "ally",
  "fully",
  //"lessly",
  "ory",
  "berry",
  "ity",
  "ability",
  //"ibility",
};

/*
static const char * prefixes[] =
{
"after",
"air",
"ante",
"anti",
"arch",
"back",
"be",
//"blood",
"blue",
"chemo",
//"contra",
"counter",
"cross",
"demi",
//"dis",
"disen",
"down",
//"en",
"equi",
"fire",
"fore",
"free",
"green",
"head",
"high",
"home",
"horse",
"house",
//"immuno",
//"in",
"infra",
"inter",
"intra",
"land",
"meso",
//"mid",
"milli",
"mis",
"multi",
//"night",
"non",
"out",
"over",
//"philo",
"photo",
"post",
"pre",
//"predis",
"proto",
"pseudo",
"quadri",
"re",
"school",
"semi",
//"side",
"snow",
"stock",
"stone",
"sub",
"sulpho",
"super",
"supra",
"thermo",
"trans",
"ultra",
"un",
//"uncon",
"under",
//"undis",
"up",
"white",
"wood",
"work",
};

static const char * postfixes[] =
{
"er",
"istic",
//"d",
"head",
"ed",
"headed",
"weed",
"fied",
"ened",
"hearted",
"field",
"land",
"hood",
"wood",
"board",
"ward",
"bird",
//"ae",
//"dae",
"age",
"fishe",
"erie",
"berrie",
"itie",
"like",
//"dale",
"able",
//"isable",
"ville",
"sville",
"some",
"stone",
//"shire",
"se",
"wise",
"nesse",
//"dnesse",
//"inesse",
"linesse",
"house",
"esque",
"proof",
"ing",
"making",
//"ling",
//"ening",
//"ising",
"sburg",
"graph",
"ish",
"fish",
"back",
"work",
"al",
"logical",
//"ional",
"ful",
"dom",
"ism",
//"ianism",
"man",
"woman",
"sman",
"men",
"women",
"smen",
"town",
//"boro",
//"hip",
"ship",
"manship",
"monger",
"ier",
"lier",
"maker",
"flower",
//"as",
"ias",
//"woods",
"nces",
//"ages",
//"ncies",
//"ties",
"les",
"nes",
"ednes",
//"ablenes",
//"ivenes",
"ingnes",
"ishnes",
"fulnes",
"lessnes",
//"ures",
"tes",
//"ites",
//"ngs",
//"is",
//"als",
//"ons",
//"ers",
//"lers",
//"ters",
//"ors",
//"ss",
//"ess",
//"us",
//"ous",
//"ious",
"let",
"craft",
"ant",
"ment",
"root",
"wort",
"iest",
"liest",
//"tou",
"logy",
"ly",
"edly",
//"ively",
//"atively",
"ingly",
"ishly",
//"ily",
"ally",
//"fully",
//"lessly",
//"ory",
"berry",
"ity",
"ability",
//"ibility",
};
*/


static const char * prefixes[] =
{
"after",
"air",
"ante",
"anti",
"arch",
"back",
"be",
//"blood",
"blue",
"chemo",
//"contra",
"counter",
"cross",
"demi",
//"dis",
"disen",
"down",
//"en",
"equi",
"fire",
"fore",
"free",
"green",
"head",
"high",
"home",
"horse",
"house",
//"immuno",
//"in",
//"infra",
"inter",
"intra",
"land",
"meso",
//"mid",
"milli",
"mis",
"multi",
//"night",
"non",
"out",
"over",
//"philo",
"photo",
"post",
"pre",
//"predis",
"proto",
"pseudo",
"quadri",
"re",
"school",
"semi",
//"side",
"snow",
"stock",
"stone",
"sub",
"sulpho",
"super",
"supra",
"thermo",
"trans",
"ultra",
"un",
//"uncon",
"under",
//"undis",
"up",
"white",
"wood",
"work",
};

static const char * postfixes[] =
{
"er",
"istic",
//"d",
"head",
"ed",
"headed",
"weed",
"fied",
"ened",
"hearted",
"field",
"land",
"hood",
"wood",
"board",
"ward",
"bird",
//"ae",
//"dae",
"age",
"fishe",
"erie",
"berrie",
"itie",
"like",
//"dale",
"able",
//"isable",
"ville",
"sville",
"some",
"stone",
//"shire",
"se",
"wise",
"nesse",
//"dnesse",
//"inesse",
//"linesse",
"house",
"esque",
"proof",
"ing",
"making",
//"ling",
//"ening",
//"ising",
"sburg",
"graph",
"ish",
"fish",
"back",
"work",
"al",
"logical",
//"ional",
"ful",
"dom",
"ism",
//"ianism",
"man",
"woman",
//"sman",
"men",
"women",
//"smen",
"town",
//"boro",
//"hip",
"ship",
"manship",
"monger",
"ier",
//"lier",
"maker",
"flower",
//"as",
//"ias",
//"woods",
//"nces",
//"ages",
//"ncies",
//"ties",
"les",
"nes",
//"ednes",
//"ablenes",
//"ivenes",
"ingnes",
//"ishnes",
"fulnes",
"lessnes",
//"ures",
"tes",
//"ites",
//"ngs",
//"is",
//"als",
//"ons",
//"ers",
//"lers",
//"ters",
//"ors",
//"ss",
//"ess",
//"us",
//"ous",
//"ious",
"let",
"craft",
"ant",
"ment",
"root",
"wort",
"iest",
//"liest",
//"tou",
"logy",
"ly",
//"edly",
//"ively",
//"atively",
"ingly",
//"ishly",
//"ily",
"ally",
//"fully",
//"lessly",
//"ory",
"berry",
"ity",
"ability",
//"ibility",
};


const int prefixCount = sizeof(prefixes) / sizeof(prefixes[0]);
const int postfixCount = sizeof(postfixes) / sizeof(postfixes[0]);

struct Word
{
  int length;
  char text[MAX_WORD_LEN + 1];
  bool isValid;
};

struct Stats
{
  float weight;
  int count;
  char text[MAX_WORD_LEN];
  int length;
  int validness;
};

class subStr : public std::string
{
public:
  subStr(const char * str, int length) : std::string(str, length) { }
  subStr(const char * str, int pos, int length) : std::string(str + pos, length) { }
  operator const char * () const { return c_str(); }
};

static Word dict[maxDictSize];
static int dictSize = 0;
static Word samples[maxSamplesSize];
static int samplesSize = 0;

typedef std::map<int, Stats> HashStatsMap;
static HashStatsMap morphStats;

static BitField mainBloom(mainBloomBytesCount);
static unsigned short prefixHashes[prefixCount];
static unsigned short postfixHashes[postfixCount];

static Grams validGrams;
static Grams validMultiVows;
static Grams validMultiCons;

void wait()
{
  std::cout << "Press any key\r\n";
  getchar();
}

void quit(int retVal = 0)
{
  wait();
  exit(retVal);
}

int getHash(const char * str, int length = INT_MAX, int seed = 19)
{
#ifdef TEST_HASH_SEEDS
  seed = hashSeed;
#endif
  return Hashes::getHashLy(str, length, seed);
}

int getWordCode(const Word & word)
{
  const char * text = word.text;
  int length = word.length;

  if (*(short*)(text + length - 2) == 's\'')
    length -= 2;
  
  if (text[length - 1] == 's')
    length--;

  const int minRootLength = 4;
  const int hashMask = 0xFFFF;

  if (usePostfixCutOff)
  {
    for (int len = min(maxPostfixLength, length - minRootLength); len > 1; len--)
    {
      for (int i = 0; i < postfixCount; i++)
      {

#ifdef TEST_POSTFIXES
        if (i != testedPostfix)
#endif
        if ((getHash(text + length - len, len) & hashMask) == postfixHashes[i])
        {
          length -= len;
          len = 0;
          break;
        }
      }
    }
  }

  if (usePrefixCutOff)
  {
    for (int len = min(maxPrefixLength, length - minRootLength); len > 1; len--)
    {
      for (int i = 0; i < prefixCount; i++)
      {
#ifdef TEST_PREFIXES
        if (i != testedPrefix)
#endif
        if ((getHash(text, len) & hashMask) == prefixHashes[i])
        {
          text += len;
          length -= len;
          len = 0;
          break;
        }
      }
    }
  }

  return getHash(text, length) % mainBloomBitsCount;
}

std::string makeFullName(const char * fileName)
{
  std::string fullName = appArgv[0];
  std::string::size_type lastSlashIndex = fullName.rfind('\\');

  if (lastSlashIndex != std::string::npos)
    fullName.erase(lastSlashIndex + 1);
  else
  {
    std::cout << "Application path parsing error\r\n";
    quit(-1);
  }

  return fullName + fileName;
}

int loadDict(const char * filename)
{
  std::fstream dictFile;
  dictFile.open(makeFullName(filename), std::ios::in);
  Word * word = dict;

  while (dictFile.good())
  {
    dictFile.getline(word->text, MAX_WORD_LEN);
    word->length = (int)dictFile.gcount() - 1;
    word->isValid = true;

    for (char * ch = word->text; *ch; ch++)
      if (*ch >= 'A' && *ch <= 'Z')
        *ch -= ('A' - 'a');

    dictSize++;
    word++;
  }

  dictFile.close();

  return dictSize;
}

void loadTest(const char * filename)
{
  FILE * fh = fopen(makeFullName(filename).c_str(), "rb");
  fseek(fh, 0, SEEK_END);
  int fileSize = ftell(fh);
  std::vector<char> buffer(fileSize);
  fseek(fh, 0, SEEK_SET);
  size_t success = fread(buffer.data(), fileSize, 1, fh);
  fclose(fh);
  Word * sample = samples + samplesSize;

  if (success)
  {
    char * bufPtr = buffer.data();
    char * wordBegin = NULL;
    int wordLength = 0;

    while (bufPtr < buffer.data() + fileSize)
    {
      if (*bufPtr == '\"')
      {
        if (!wordBegin)
          wordBegin = bufPtr + 1;
        else
          wordLength = bufPtr - wordBegin;
      }

      if (*bufPtr == ':')
      {
        sample->length = min(wordLength, MAX_WORD_LEN);
        strncpy(sample->text, wordBegin, sample->length);
        sample->isValid = !strncmp(bufPtr + 2, "true", 4);

        if (strncmp(bufPtr + 2, "true", 4) && strncmp(bufPtr + 2, "false", 5))
        {
          std::cout << "Parsing error at: " << samplesSize << " word\r\n";
          quit(-1);
        }

        sample++;
        samplesSize++;
        wordBegin = NULL;
        wordLength = 0;
      }

      bufPtr++;
    }
  }
}

//void convertSamples()
//{
//  char name[2048];
//  char buf[2048];
//  const char * nameFormat = "%06i";
//  std::fstream inFile;
//  std::fstream outFile;
//
//  inFile.open(makeFullName("..\\data\\samples_large.json"), std::ios::in | std::ios::binary);
//
//  int counter = -1;
//
//  while (inFile.good())
//  {
//    if (!outFile.is_open())
//    {
//      counter++;
//      sprintf(name, nameFormat, counter);
//      std::string filename = "..\\data\\samples\\";
//      filename = filename + name;
//      filename = filename + ".json";
//      outFile.open(makeFullName(filename.c_str()), std::ios::out | std::ios::binary);
//    }
//
//    if (!outFile.good())
//      break;
//
//    inFile.getline(buf, 2048);
//    outFile << buf << "\n";
//
//    if (!strcmp(buf, "}\r"))
//      outFile.close();
//  }
//}

unsigned char recountWeight(float weight)
{
  int weight32 = int(weight / 100000.0f * 255.0f);
  unsigned char weight8 = clamp(weight32, 0, 255);
  return weight8;
}

bool saveData(const char * filename)
{
  std::fstream dataFile;
  dataFile.open(makeFullName(filename), std::ios::out | std::ios::binary);

  int offset = 0;
  std::cout << "Data file offsets: " << "\r\n\r\n";

  if (useMainBloomTest)
  {
    dataFile.write((char*)mainBloom.data(), mainBloom.size());
    std::cout << "mainBloomOffset = " << offset << "; // size = " << mainBloom.size() << "\r\n";
    offset += mainBloom.size();
  }

  if (useGramTest && validGrams.bitField())
  {
    dataFile.write((char*)validGrams.bitField()->data(), validGrams.bitField()->size());
    std::cout << "gramsBloomOffset = " << offset << "; // size = " << validGrams.bitField()->size() << "\r\n";
    offset += validGrams.bitField()->size();
  }

  if (useMultiVovsTest && validMultiVows.bitField())
  {
    dataFile.write((char*)validMultiVows.bitField()->data(), validMultiVows.bitField()->size());
    std::cout << "multiVowsBloomOffset = " << offset << "; // size = " << validMultiVows.bitField()->size() << "\r\n";
    offset += validMultiVows.bitField()->size();
  }

  if (useMultiConsTest && validMultiCons.bitField())
  {
    dataFile.write((char*)validMultiCons.bitField()->data(), validMultiCons.bitField()->size());
    std::cout << "multiConsBloomOffset = " << offset << "; // size = " << validMultiCons.bitField()->size() << "\r\n";
    offset += validMultiCons.bitField()->size();
  }

  if (usePrefixCutOff)
  {
    dataFile.write((char*)prefixHashes, sizeof(prefixHashes));
    std::cout << "prefixHashArrayOffset = " << offset << "; // size = " << sizeof(prefixHashes) << "\r\n";
    offset += sizeof(prefixHashes);
  }

  if (usePostfixCutOff)
  {
    dataFile.write((char*)postfixHashes, sizeof(postfixHashes));
    std::cout << "postfixHashArrayOffset = " << offset << "; // size = " << sizeof(postfixHashes) << "\r\n";
    offset += sizeof(postfixHashes);
  }

  if (useMorphStatsTest)
  {
    for (HashStatsMap::iterator it = morphStats.begin(); it != morphStats.end(); ++it)
    {
      short hash = it->first;
      unsigned char weight = recountWeight(it->second.weight);
      dataFile.write((char *)&hash, 2);
      dataFile.write((char *)&weight, 1);
    }

    std::cout << "const morphStatsArrayOffset = " << offset << "; // size = " << morphStats.size() * 3 << "\r\n";
    offset += morphStats.size() * 3;
  }

  std::cout << "\r\n";
  std::cout << "File size: " << offset;
  std::cout << " left: " << 65536 - offset << " bytes\r\n\r\n";

  return dataFile.good();
}

//bool loadData(const char * filename)
//{
//  std::fstream dataFile;
//  dataFile.open(makeFullName(filename), std::ios::in | std::ios::binary);
//
//  if (useMainBloomTest)
//    dataFile.read((char*)mainBloom.data(), mainBloom.size());
//
//  if (useGramTest && validGrams.bitField())
//    dataFile.read((char*)validGrams.bitField()->data(), validGrams.bitField()->size());
//
//  if (useMultiVovsTest && validMultiVows.bitField())
//    dataFile.read((char*)validMultiVows.bitField()->data(), validMultiVows.bitField()->size());
//
//  if (useMultiConsTest && validMultiCons.bitField())
//    dataFile.read((char*)validMultiCons.bitField()->data(), validMultiCons.bitField()->size());
//
//  if (usePrefixCutOff)
//    dataFile.read((char*)prefixHashes, sizeof(prefixHashes));
//  
//  if (usePostfixCutOff)
//    dataFile.read((char*)postfixHashes, sizeof(postfixHashes));
//
//  return dataFile.good();
//}

bool loadHashMap(const char * filename)
{
  bool retVal = false;
  int count = -1;

  std::fstream hashMapFile;
  hashMapFile.open(filename, std::ios::in | std::ios::binary);

  if (hashMapFile.good())
  {
    int elementSize = -1;
    int elementsCount = -1;
    hashMapFile.read((char *)&elementSize, sizeof(elementSize));
    hashMapFile.read((char *)&elementsCount, sizeof(elementsCount));

    if (hashMapFile.good())
    {
      if (elementSize == sizeof(Stats))
      {
        count = elementsCount + 1;

        while (count--)
        {
          int hash = 0;
          hashMapFile.read((char *)&hash, sizeof(hash));

          if (!hashMapFile.good())
            break;

          Stats & stats = morphStats[hash];

          hashMapFile.read((char *)&stats, sizeof(stats));

          if (!hashMapFile.good())
            break;
        }
      }
    }
  }

  hashMapFile.close();

  return !count;
}

bool saveHashMap(const char * filename)
{
  int count = -1;
  std::fstream HashMapFile;
  HashMapFile.open(filename, std::ios::out | std::ios::binary);

  if (HashMapFile.good())
  {
    int elementSize = sizeof(Stats);
    int elementsCount = (int)morphStats.size();
    HashMapFile.write((char *)&elementSize, sizeof(elementSize));
    HashMapFile.write((char *)&elementsCount, sizeof(elementsCount));

    if (HashMapFile.good())
    {
      count = elementsCount;

      for (HashStatsMap::iterator HashMapIt = morphStats.begin(); HashMapIt != morphStats.end(); ++HashMapIt)
      {
        count--;
        HashMapFile.write((char *)&HashMapIt->first, sizeof(HashMapIt->first));
        HashMapFile.write((char *)&HashMapIt->second, sizeof(HashMapIt->second));

        if (!HashMapFile.good())
          break;
      }
    }
  }

  HashMapFile.close();

  return !count;
}

void fillMorphStats()
{
  std::cout << "Filling hash table\r\n";
  clock_t startClock = clock();
  clock_t lastLogClock = startClock;
  morphStats.clear();

  for (int i = 0; i < dictSize; i++)
  {
    Word & dictWord = dict[i];

    for (int pos = 0; pos < dictWord.length; pos++)
    {
      for (int len = 1; len <= min(dictWord.length - pos, maxMorphemLength); len++)
      {
        int hash = getHash(dictWord.text + pos, len);
        HashStatsMap::iterator randHasheIt = morphStats.find(hash);

        if (randHasheIt == morphStats.end())
        {
          Stats & stats = morphStats[hash];
          strncpy(stats.text, dictWord.text + pos, len);
          stats.length = len;
          stats.validness = 0;
          stats.count = 1;
          stats.weight = 1;
        }
        else
        {
          Stats & stats = randHasheIt->second;
          stats.count++;
          stats.weight += 1;
        }
      }
    }

    if (clock() - lastLogClock > logIntervalMs || i == dictSize - 1)
    {
      lastLogClock = clock();
      std::cout << "\r" << std::setprecision(1) << std::fixed;
      std::cout << " Progress: " << std::setw(6) << float(i) * 100 / dictSize << " % ";
      std::cout << " Hash count: " << std::setw(5) << morphStats.size();
      std::cout << " Time left: " << std::setw(5) << float(clock() - startClock) / i * (dictSize - i) / 1000 << " sec ";
      std::cout << "                     ";
    }
  }

  std::cout << "\r\n";
}

float countMorphCriteria(Stats * leftHashStats, Stats * midHashStats, Stats * rightHashStats)
{
  float leftMidK = 0.5f;
  float rightK = 0.7f;
  float sq = 0.75f;
  float leftCriteria = (float)pow(leftHashStats->weight, pow(leftHashStats->length, leftMidK)) / 1e7f;

  float midCriteria = 1.0f;
  if (midHashStats)
  {
    sq += 0.75f;
    midCriteria = (float)pow(midHashStats->weight, pow(midHashStats->length, leftMidK)) / 1e7f;
  }

  float rightCriteria = 1.0f;

  if (rightHashStats)
  {
    sq += 0.75f;
    rightCriteria = (float)pow(rightHashStats->weight, pow(rightHashStats->length, rightK)) / 1e7f;
  }

  float morphCriteria = pow(leftCriteria * midCriteria * rightCriteria, 1.0f / sq);

  return morphCriteria;
}

void validateHashMap()
{
  std::cout << "Validating hash table\r\n";
  const int coveringTreshold = 5;
  clock_t startClock = clock();
  clock_t lastLogClock = startClock;
  std::fstream morphFile;
  morphFile.open(makeFullName("..\\data\\Morphems.txt"), std::ios::out);

  for (int i = 0; i < dictSize; i++)
  {
    Word & dictWord = dict[i];
    float bestMorphCriteria = 0.0f;
    int bestPos = 0;
    int bestLen = 0;
    float prevMorphCriteria = 0.0f;
    int prevPos = 0;
    int prevLen = 0;

    for (int pos = 0; pos < dictWord.length; pos++)
    {
      for (int len = 1; len <= min(dictWord.length - pos, maxMorphemLength); len++)
      {
        float morphCriteria = 0.0f;

        if (!pos && len == dictWord.length)
        {
          int leftHash = getHash(dictWord.text, dictWord.length);
          HashStatsMap::iterator leftHasheIt = morphStats.find(leftHash);

          if (leftHasheIt != morphStats.end() && leftHasheIt->second.weight > coveringTreshold)
            morphCriteria = countMorphCriteria(&leftHasheIt->second, NULL, NULL);
        }
        else if (pos && len == dictWord.length - pos)
        {
          int leftHash = getHash(dictWord.text, pos);
          int rightHash = getHash(dictWord.text + pos, len);
          HashStatsMap::iterator leftHasheIt = morphStats.find(leftHash);
          HashStatsMap::iterator rightHasheIt = morphStats.find(rightHash);

          if (leftHasheIt != morphStats.end() && leftHasheIt->second.weight > coveringTreshold &&
              rightHasheIt != morphStats.end() && rightHasheIt->second.weight > coveringTreshold)
          {
            morphCriteria = countMorphCriteria(&leftHasheIt->second, NULL, &rightHasheIt->second);
          }
        }
        else if (!pos && len < dictWord.length)
        {
          int leftHash = getHash(dictWord.text, len);
          int rightHash = getHash(dictWord.text + len, dictWord.length - pos);
          HashStatsMap::iterator leftHasheIt = morphStats.find(leftHash);
          HashStatsMap::iterator rightHasheIt = morphStats.find(rightHash);

          if (leftHasheIt != morphStats.end() && leftHasheIt->second.weight > coveringTreshold &&
              rightHasheIt != morphStats.end() && rightHasheIt->second.weight > coveringTreshold)
          {
            morphCriteria = countMorphCriteria(&leftHasheIt->second, NULL, &rightHasheIt->second);
          }
        }
        else
        {
          int leftHash = getHash(dictWord.text, pos);
          int midHash = getHash(dictWord.text + pos, len);
          int rightHash = getHash(dictWord.text + pos + len, dictWord.length - pos - len);
          HashStatsMap::iterator leftHasheIt = morphStats.find(leftHash);
          HashStatsMap::iterator midHasheIt = morphStats.find(midHash);
          HashStatsMap::iterator rightHasheIt = morphStats.find(rightHash);

          if (leftHasheIt != morphStats.end() && leftHasheIt->second.weight > coveringTreshold &&
              midHasheIt != morphStats.end() && midHasheIt->second.weight > coveringTreshold &&
              rightHasheIt != morphStats.end() && rightHasheIt->second.weight > coveringTreshold)
          {
            morphCriteria = countMorphCriteria(&leftHasheIt->second, &midHasheIt->second, &rightHasheIt->second);
          }
        }

        if (morphCriteria > bestMorphCriteria)
        {
          prevMorphCriteria = bestMorphCriteria;
          prevPos = bestPos;
          prevLen = bestLen;
          bestMorphCriteria = morphCriteria;
          bestPos = pos;
          bestLen = len;
        }
      }
    }

    int leftHash = getHash(dictWord.text, bestPos);
    HashStatsMap::iterator leftHasheIt = morphStats.find(leftHash);

    if (leftHasheIt != morphStats.end())
      leftHasheIt->second.validness++;

    int midHash = getHash(dictWord.text + bestPos, bestLen);
    HashStatsMap::iterator midHasheIt = morphStats.find(midHash);

    if (midHasheIt != morphStats.end())
      midHasheIt->second.validness++;

    int rightHash = getHash(dictWord.text + bestPos + bestLen, dictWord.length - bestPos - bestLen);
    HashStatsMap::iterator rightHasheIt = morphStats.find(rightHash);

    if (rightHasheIt != morphStats.end())
      rightHasheIt->second.validness++;

    morphFile << std::setw(16) << bestMorphCriteria;
    morphFile << " [ " << std::setw(18) << prevMorphCriteria << " ] : ";
    morphFile << subStr(dictWord.text, 0, bestPos) << (bestPos ? "_" : "");
    morphFile << subStr(dictWord.text, bestPos, bestLen) << ((bestPos + bestLen < dictWord.length) ? "_" : "");
    morphFile << subStr(dictWord.text, bestPos + bestLen, dictWord.length - bestPos - bestLen);

    morphFile << "        ( ";
    morphFile << subStr(dictWord.text, 0, prevPos) << (prevPos ? "_" : "");
    morphFile << subStr(dictWord.text, prevPos, prevLen) << ((prevPos + prevLen < dictWord.length) ? "_" : "");
    morphFile << subStr(dictWord.text, prevPos + prevLen, dictWord.length - prevPos - prevLen);
    morphFile << " )\r\n";
    
    if (clock() - lastLogClock > logIntervalMs || i == dictSize - 1)
    {
      lastLogClock = clock();
      std::cout << std::setprecision(1) << std::fixed << "\r";
      std::cout << " Progress: " << std::setw(6) << float(i) * 100 / dictSize << " % ";
      std::cout << " Time left: " << std::setw(5) << float(clock() - startClock) / i * (dictSize - i) / 1000 << " sec ";
      std::cout << std::setw(30) << "";
    }
  }

  std::cout << "\r\n";
}

void filterHasheTable()
{
  std::cout << "Shrinking hash table\r\n";
  std::cout << "\r\n";
  std::multiset<float> coverIndex;
  std::fstream validMorphems;
  std::fstream invalidMorphems;
  validMorphems.open(makeFullName("..\\data\\MorphemsValids.txt"), std::ios::out);
  invalidMorphems.open(makeFullName("..\\data\\MorphemsInvalids.txt"), std::ios::out);

  for (HashStatsMap::iterator hasheIt = morphStats.begin(); hasheIt != morphStats.end(); ++hasheIt)
    coverIndex.insert((float)hasheIt->second.validness * hasheIt->second.weight * hasheIt->second.length * hasheIt->second.length);

  float threshold = 0;
  int cnt = 0;

  for (std::set<float>::reverse_iterator coverIndexIt = coverIndex.rbegin(); coverIndexIt != coverIndex.rend(); ++coverIndexIt)
  {
    if (cnt++ >= maxHashCount)
    {
      threshold = *coverIndexIt;
      std::cout << "Validation threshold = " << threshold << "\r\n";
      break;
    }
  }

  HashStatsMap tmpHashMap;

  for (HashStatsMap::iterator hasheIt = morphStats.begin();
       hasheIt != morphStats.end();)
  {
    if (hasheIt->second.validness * hasheIt->second.weight * hasheIt->second.length * hasheIt->second.length <= threshold)
    {
      std::map<int, Stats>::iterator eraseIt = hasheIt++;
      morphStats.erase(eraseIt);
      invalidMorphems << hasheIt->second.text << "\r\n";
    }
    else
    {
      int hash = hasheIt->first & 0xFFFF;
      tmpHashMap[hash] = hasheIt->second;
      ++hasheIt;
      validMorphems << hasheIt->second.text << "\r\n";
    }
  }

  morphStats = tmpHashMap;
}

bool testValidGrams(const Word & word)
{
  for (int pos = 0; pos < word.length - gramLength; pos++)
    if (!validGrams.test(word.text + pos, gramLength))
      return false;

  return true;
}

bool testMultiVows(const Word & word)
{
  int vowCnt = 0;

  for (int pos = 0; pos < word.length; pos++)
  {
    char ch = word.text[pos];

    //if (ch == '\'')
    //  break;

    if (strchr(vowels, ch))
      vowCnt++;
    else
    {
      if (vowCnt > maxVowelsCount && !validMultiVows.test(word.text + pos - vowCnt, vowCnt))
        return false;

      vowCnt = 0;
    }
  }

  return true;
}

bool testMultiCons(const Word & word)
{
  int conCnt = 0;

  for (int pos = 0; pos < word.length; pos++)
  {
    char ch = word.text[pos];

    //if (ch == '\'')
    //  break;

    if (!strchr(vowels, ch))
      conCnt++;
    else
    {
      if (conCnt > maxConsonantsCount && !validMultiCons.test(word.text + pos - conCnt, conCnt))
        return false;

      conCnt = 0;
    }
  }

  return true;
}

bool hasNoise(const Word & word)
{
  if (word.length > maxValidWordLength)
    return true;

  if (useGramTest && !testValidGrams(word))
    return true;

  if (word.length > 3 && word.text[0] == word.text[1])
    return true;

  if (useMultiVovsTest && !testMultiVows(word))
    return true;

  if (useMultiConsTest && !testMultiCons(word))
    return true;

  const char * apos = strchr(word.text, '\'');

  if (apos && apos != word.text + word.length - 2)
    return true;

  return false;
}

unsigned char getWordWeight(const Word & word)
{
  if (hasNoise(word))
    return 0;

  if (word.length == 1)
    return 255;

  if(useMainBloomTest && !mainBloom.get(getWordCode(word)))
    return 0;

  unsigned char weight = 0;

  if (useMorphStatsTest)
  {
    int tests = 0;
    int hits = 0;

    for (int pos = 0; pos <= word.length - minMorphemLength; pos++)
    {
      const int minLength = minMorphemLength;
      const int maxLength = min(word.length - pos, maxMorphemLength);

      for (int len = minLength; len <= maxLength; len++)
      {
        tests++;
        int hash = getHash(word.text + pos, len) & 0xFFFF;

        HashStatsMap::iterator hashIt = morphStats.find(hash);

        if (hashIt != morphStats.end())
          hits += recountWeight(hashIt->second.weight);
      }
    }

    weight = tests ? hits / tests : 0;
  }
  else
    weight = 255;

  return weight;
}

bool testWord(const Word & word, bool isValid)
{

#ifdef SHOW_DEBUG_COUNTERS
  {
    int len = min(word.length, maxValidWordLength);
    const char * apos = strchr(word.text, '\'');
    unsigned char weight8 = getWordWeight(word);
    unsigned char thresholds[maxValidWordLength] =
    {
      1,
      1,
      43,
      29,
      47,
      39,
      43,
      61,
      58,
      70,
      72,
      80,
      84,
      92,
      98,
      106,
    };
    c0++;
    c1 += (word.length != 1);
    c2 += (apos && apos != word.text + word.length - 2);
    c3 += (word.length > maxValidWordLength);
    c4 += (word.length > 3 && word.text[0] == word.text[1]);
    c5 += (useMultiVovsTest && !testMultiVows(word));
    c6 += (useMultiConsTest && !testMultiCons(word));
    c7 += (useGramTest && !testValidGrams(word));
    c8 += (useMainBloomTest && !mainBloom.get(getWordCode(word)));
    c9 += (useMorphStatsTest && weight8 < thresholds[len - 1]);
  }
#endif

  int len = min(word.length, maxValidWordLength);
  unsigned char thresholds[maxValidWordLength] =
  {
    1,
    1,
    43,
    29,
    47,
    39,
    43,
    61,
    58,
    70,
    72,
    80,
    84,
    92,
    98,
    106,
  };

  unsigned char weight8 = getWordWeight(word);

  if (useMorphStatsTest && weight8 < thresholds[len - 1])
    return false;

  return true;
}

int testSampleWords()
{
#ifdef BUILD_THRESHOLD_TABLE

  clock_t startClock = clock();
  clock_t lastLogClock = startClock;
  const int maxLen = maxValidWordLength + 1;
  float midWeight = 0.0f;
  int midTestCount = 0;
  int thresholds[thresholdCount];
  static float wordHits[maxSamplesSize];
  int lengthWordCount[maxLen];
  memset(lengthWordCount, 0, sizeof(lengthWordCount));
  const int thrw = 10;
  const int viw = 5;
  const int accw = 6;
  const int fullw = 330;

  for (int i = 0; i < samplesSize; i++)
  {
    Word & word = samples[i];
    wordHits[i] = getWordWeight(word);
    midWeight += wordHits[i];
    midTestCount++;
    int lengthIndex = min(word.length, maxLen) - 1;
    lengthWordCount[lengthIndex]++;

    if (clock() - lastLogClock > logIntervalMs || i == samplesSize - 1)
    {
      lastLogClock = clock();
      std::cout << std::setprecision(3) << std::fixed << "\r";
      std::cout << " Progress: " << std::setw(6) << float(i) * 100 / samplesSize << " % ";
      std::cout << " Time left: " << std::setw(5) << float(clock() - startClock) / i * (samplesSize - i) / 1000 << " sec ";
      std::cout << std::setw(30) << "";
    }
  }
  std::cout << "\r\n\r\n";

  midWeight /= midTestCount;
  std::cout << "Mid weight: " << midWeight << "\r\n";
  const float beginMidTestK = 0.0f;
  const float endMidTestK = 2.5f;
  int bestThres[maxLen];
  float bestAccur[maxLen];

  for (int i = 0; i < maxLen; i++)
  {
    bestThres[i] = 0;
    bestAccur[i] = 0.0f;
  }

  for (int t = 0; t < thresholdCount; t++)
    thresholds[t] = int(beginMidTestK * midWeight + (endMidTestK - beginMidTestK) * midWeight * t / thresholdCount);

  std::cout << std::setprecision(2) << std::fixed << "\r\n";
  std::cout << std::setw(thrw) << "Threshold" << "  ||  ";

  for (int i = 0; i < maxLen; i++)
    std::cout << std::setw(viw) << "ve/ie" << " : " << std::setw(accw) << "Acc." << " | ";

  std::cout << "\r\n" << std::setfill('-') << std::setw(fullw) << "\r\n" << std::setfill(' ');

  for (int t = 0; t < thresholdCount; t++)
  {
    std::cout << std::setw(thrw) << thresholds[t] << "  ||  ";

    for (int len = 1; len <= maxLen; len++)
    {
      int count = 0;
      int validErrors = 0;
      int invalidErrors = 0;

      for (int i = 0; i < samplesSize; i++)
      {
        Word & word = samples[i];

        if (word.length == len || (len == maxLen && word.length >= len))
        {
          if (word.isValid && wordHits[i] < thresholds[t])
            validErrors++;
          else if (!word.isValid && wordHits[i] >= thresholds[t])
            invalidErrors++;

          count++;
        }
      }

      int sumErrors = validErrors + invalidErrors;
      float validErrorsRate = sumErrors ? float(validErrors) / sumErrors : -1;
      float accur = 100.0f - float(sumErrors) * 100 / count;
      std::cout << std::setw(viw) << validErrorsRate << " : " << std::setw(accw) << accur << " | ";

      if (accur > bestAccur[len - 1])
      {
        bestAccur[len - 1] = accur;
        bestThres[len - 1] = thresholds[t];
      }
    }

    std::cout << "\r\n";
  }

  std::cout << std::setfill('-') << std::setw(fullw) << "\r\n" << std::setfill(' ');
  std::cout << std::setw(thrw) << "" << "  ||  ";
  int sumCount = 0;
  float sumAccur = 0.0f;

  for (int i = 0; i < maxLen; i++)
  {
    std::cout << std::setw(viw + 1) << lengthWordCount[i] << ": " << std::setw(accw) << bestAccur[i] << " | ";
    sumAccur += bestAccur[i] * lengthWordCount[i];
    sumCount += lengthWordCount[i];
  }

  std::cout << "\r\n\r\nThresholds:\r\n\r\n";

  for (int i = 0; i < maxLen - 1; i++)
    std::cout << bestThres[i] << ",\r\n";

  std::cout << std::setprecision(5) << std::fixed;
  std::cout << "\r\n";
  std::cout << "\r\n";
  std::cout << "Sum Count: " << sumCount << "\r\n";
  std::cout << "Sum Accuracy: " << sumAccur / sumCount << "\r\n";
  std::cout << "\r\n";

#endif BUILD_THRESHOLD_TABLE

#ifdef SAVE_FAIL_STATS
  std::fstream validFails;
  std::fstream invalidFails;
  validFails.open(makeFullName("..\\data\\failedValids.txt"), std::ios::out);
  invalidFails.open(makeFullName("..\\data\\failedInvalids.txt"), std::ios::out);
  std::list<std::string> invalidFailsList;
  std::list<std::string> validFailsList;
#endif

  int errors = 0;

  for (int i = 0; i < samplesSize; i++)
  {
    Word & word = samples[i];

    if (testWord(word, word.isValid) != word.isValid)
    {
#ifdef SAVE_FAIL_STATS
      if (word.isValid)
        validFailsList.emplace_back(word.text);
      else
        invalidFailsList.emplace_back(word.text);
#endif
      errors++;
    }
  }
#ifdef SAVE_FAIL_STATS  
  invalidFailsList.sort();
  validFailsList.sort();

  for (std::list<std::string>::iterator it = validFailsList.begin(); it != validFailsList.end(); it++)
    validFails << it->c_str() << "\r\n";

  for(std::list<std::string>::iterator it = invalidFailsList.begin(); it != invalidFailsList.end(); it++)
    invalidFails << it->c_str() << "\r\n";
#endif

#if !defined(TEST_MAIN_BLOOM_SIZE) && !defined(TEST_HASH_SEEDS) && !defined(TEST_GRAMS_COUNT) && !defined(TEST_CONS_GRAMS_COUNT) && !defined(TEST_PREFIXES) && !defined(TEST_POSTFIXES)
  std::cout << std::setprecision(3) << std::fixed << "";
  std::cout << "Final tests: " << samplesSize << "\r\n";
  std::cout << "Final errors: " << errors << "\r\n";
  std::cout << "Final accuracy: " << 100.f * (1.0f - float(errors) / samplesSize) << "\r\n";
#endif

  return int(100000 * (1.0f - float(errors) / samplesSize));
}

void fillMainBloom()
{
  for (int i = 0; i < dictSize; i++)
  {
    Word & word = dict[i];

    if (!hasNoise(word) && word.length > 1 && word.length <= maxValidWordLength)
      mainBloom.set(getWordCode(word));
  }
}

void fillPrefixHashes()
{
  for (int i = 0; i < prefixCount; i++)
    prefixHashes[i] = getHash(prefixes[i]);
}

void fillPostfixHashes()
{
  for (int i = 0; i < postfixCount; i++)
    postfixHashes[i] = getHash(postfixes[i]);
}

void fillValidGrams()
{
  for (int i = 0; i < dictSize; i++)
    for (int pos = 0; pos < dict[i].length - gramLength; pos++)
      validGrams.add(dict[i].text + pos, gramLength);

  std::cout << "Grams count: " << validGrams.size();
  std::cout << " limit: " << maxGramSamplesCount;
  int dropped = validGrams.limit(maxGramSamplesCount);
  std::cout << " dropped: " << dropped << "\r\n";
  validGrams.createBitField();
  std::cout << "BitField size: " << validGrams.bitField()->size() << " bytes\r\n";

  int fails = 0;

  for (int i = 0; i < dictSize; i++)
  {
    for (int pos = 0; pos < dict[i].length - gramLength; pos++)
    {
      if (!validGrams.test(dict[i].text + pos, gramLength))
      {
        fails++;
        break;
      }
    }
  }


  std::cout << "Valid word fails: " << 100.0f * fails / dictSize << "%\r\n\r\n";
}

void fillMultiVowsGrams()
{
  for (int i = 0; i < dictSize; i++)
  {
    Word & word = dict[i];
    int vowCnt = 0;

    for (int pos = 0; pos < word.length; pos++)
    {
      char ch = word.text[pos];

      if (strchr(vowels, ch))
        vowCnt++;
      else
      {
        if (vowCnt > maxVowelsCount)
          validMultiVows.add(word.text + pos - vowCnt, vowCnt);

        vowCnt = 0;
      }
    }
  }

  std::cout << "MultiVows samples count: " << validMultiVows.size();
  std::cout << " limit: " << maxVowelSamplesCount;
  int dropped = validMultiVows.limit(maxVowelSamplesCount);
  std::cout << " dropped: " << dropped << "\r\n";
  validMultiVows.createBitField();
  std::cout << "BitField size: " << validMultiVows.bitField()->size() << " bytes\r\n";
  int fails = 0;

  for (int i = 0; i < dictSize; i++)
    if (!testMultiVows(dict[i]))
      fails++;

  std::cout << "Valid word fails: " << 100.0f * fails / dictSize << " % \r\n\r\n";
}

void fillMultiConsGrams()
{
  for (int i = 0; i < dictSize; i++)
  {
    Word & word = dict[i];
    int conCnt = 0;

    for (int pos = 0; pos < word.length; pos++)
    {
      char ch = word.text[pos];

      if (!strchr(vowels, ch))
        conCnt++;
      else
      {
        if (conCnt > maxConsonantsCount)
          validMultiCons.add(word.text + pos - conCnt, conCnt);

        conCnt = 0;
      }
    }
  }

  std::cout << "MultiCons samples count: " << validMultiCons.size();
  std::cout << " limit: " << maxConsonantSamplesCount;
  int dropped = validMultiCons.limit(maxConsonantSamplesCount);
  std::cout << " dropped: " << dropped << "\r\n";
  validMultiCons.createBitField();
  std::cout << "BitField size: " << validMultiCons.bitField()->size() << " bytes\r\n";
  int fails = 0;

  for (int i = 0; i < dictSize; i++)
    if (!testMultiCons(dict[i]))
      fails++;

  std::cout << "Valid word fails: " << 100.0f * fails / dictSize << " %\r\n\r\n";
}

// ================================================================================================
// ================================================================================================

int main(int argc, char * argv[])
{
  appArgc = argc;
  appArgv = argv;

  time_t curTime;
  time(&curTime);
  srand((int)curTime);

  std::cout << "\r\n";

#ifdef _DEBUG
  std::cout << "***DEBUG MODE ***" << "\r\n\n";
  loadDict("..\\data\\dictionary_small.txt");
#else
  loadDict("..\\data\\dictionary.txt");
#endif
  std::cout << "Dictionary size = " << dictSize << "\r\n";

#ifdef _DEBUG
  loadTest("..\\data\\samples_small.json");
#else
  //loadTest("..\\data\\samples_large.json");
  //loadTest("..\\data\\samples.json");
  //loadTest("..\\data\\samples10k.json");
  //loadTest("..\\data\\samples_imp.json");
  loadTest("..\\data\\samples4.json");
#endif
  std::cout << "Test samples size = " << samplesSize << "\r\n\r\n";

  if (usePrefixCutOff)
    fillPrefixHashes();

  if (usePostfixCutOff)
    fillPostfixHashes();

  if (useGramTest)
    fillValidGrams();

  if (useMultiVovsTest)
    fillMultiVowsGrams();

  if (useMultiConsTest)
    fillMultiConsGrams();

  if (useMainBloomTest)
    fillMainBloom();

  if (useMorphStatsTest)
  {
    std::cout << "Load filtered hash table";

    if (!loadHashMap(makeFullName("..\\data\\HashMapFiltered.bin").c_str()))
    {
      std::cout << " ..... FAILED\r\n";
      std::cout << "Load full hash table";

      if (!loadHashMap(makeFullName("..\\data\\HashMap.bin").c_str()))
      {
        std::cout << " ..... FAILED\r\n";
        fillMorphStats();
        validateHashMap();

        std::cout << "Save full hash table";
        if (saveHashMap(makeFullName("..\\data\\HashMap.bin").c_str()))
          std::cout << " ..... OK\r\n";
        else
          std::cout << " ..... FAILED\r\n";
      }
      else
        std::cout << " ..... OK\r\n";

      std::cout << "Hashes count = " << morphStats.size() << "\r\n";

      filterHasheTable();
      std::cout << "Save filtered hash table";

      if (saveHashMap(makeFullName("..\\data\\HashMapFiltered.bin").c_str()))
        std::cout << " ..... OK\r\n";
      else
        std::cout << " ..... FAILED\r\n";
    }
    else
      std::cout << " ..... OK\r\n";

    std::cout << "Filtered hashes count = " << morphStats.size() << "\r\n";
  }

  if (!saveData("..\\js\\data"))
    std::cout << "Failed to save bit field to file: " << makeFullName("..\\data\\Data.bin").c_str() << "\r\n";

  //if (!loadData("..\\data\\BitField.bin"))
  //  std::cout << "Failed to load bit field from file: " << makeFullName("..\\data\\BitField.bin").c_str() << "\r\n";

  std::cout << "Test word samples\r\n";


  int baseAcc = testSampleWords();

#ifdef TEST_PREFIXES
    std::cout << std::setprecision(4) << std::fixed << "Base Acc: " << baseAcc << "\r\n";
    std::fstream prefixRate;
    prefixRate.open(makeFullName("..\\data\\PrefixRate.txt"), std::ios::out);
    prefixRate << std::setprecision(4) << std::fixed << "Base Acc: " << baseAcc << "\r\n";

    for (testedPrefix = 0; testedPrefix < prefixCount; testedPrefix++)
    {
      int curAcc = testSampleWords();

      if(curAcc >= baseAcc)
        std::cout << prefixes[testedPrefix] << std::setw(10) << curAcc / 1000.0f << " : " << (curAcc - baseAcc) / 1000.0f << "\r\n";

      prefixRate << prefixes[testedPrefix] << std::setw(10) << curAcc / 1000.0f << " : " << (curAcc - baseAcc) / 1000.0f << "\r\n";
      prefixRate.flush();
    }
    testedPrefix = -1;
#endif

#ifdef TEST_POSTFIXES
    std::fstream postfixRate;
    postfixRate.open(makeFullName("..\\data\\PostfixRate.txt"), std::ios::out);
    postfixRate << std::setprecision(4) << std::fixed << "Base Acc: " << baseAcc << "\r\n";

    for (testedPostfix = 0; testedPostfix < postfixCount; testedPostfix++)
    {
      int curAcc = testSampleWords();

      if (curAcc >= baseAcc)
        std::cout << postfixes[testedPostfix] << std::setw(10) << curAcc / 1000.0f << " : " << float(curAcc - baseAcc) / 1000.0f << "\r\n";

      postfixRate << postfixes[testedPostfix] << std::setw(10) << curAcc / 1000.0 << " : " << float(curAcc - baseAcc) / 1000.0f << "\r\n";
      postfixRate.flush();
    }
    testedPostfix = -1;
#endif

#ifdef TEST_MAIN_BLOOM_SIZE
    int from = std::atoi(appArgv[1]);
    int to = std::atoi(appArgv[2]);
    int step = std::atoi(appArgv[3]);
    std::string filename = "..\\data\\MainBloomSizes_" + std::string(appArgv[1]) + "_" + std::string(appArgv[2]) + "_" + std::string(appArgv[3]) + ".txt";
    std::cout << "File: " << filename.c_str() << "\r\n";
    std::fstream mainBloomSizesFile;
    mainBloomSizesFile.open(makeFullName(filename.c_str()), std::ios::out);
    std::cout << std::setprecision(4) << std::fixed << "Base Acc: " << baseAcc << "\r\n";
    mainBloomSizesFile << std::setprecision(4) << std::fixed << "Base Acc: " << baseAcc << "\r\n";
    mainBloom.resize(to);

    for (int size = from; size <= to; size += step)
    {
      mainBloomBytesCount = size;
      mainBloomBitsCount = mainBloomBytesCount * 8;
      mainBloom.resize(size);
      fillMainBloom();
      int curAcc = testSampleWords();
      std::cout << std::setw(4) << size << std::setw(10) << curAcc << "\r\n";
      mainBloomSizesFile << std::setw(4) << size << std::setw(10) << curAcc << "\r\n";
      mainBloomSizesFile.flush();
    }
#endif

#ifdef TEST_HASH_SEEDS
    int from = std::atoi(appArgv[1]);
    int to = std::atoi(appArgv[2]);
    std::string filename = "..\\data\\Hashes_" + std::string(appArgv[1]) + "_" + std::string(appArgv[2]) + ".txt";
    std::cout << "File: " << filename.c_str() << "\r\n";
    std::fstream hashSeedsFile;
    hashSeedsFile.open(makeFullName(filename.c_str()), std::ios::out);
    std::cout << std::setprecision(4) << std::fixed << "Base Acc: " << baseAcc << "\r\n";
    hashSeedsFile << std::setprecision(4) << std::fixed << "Base Acc: " << baseAcc << "\r\n";

    for (int hash = from; hash <= to; hash++)
    {
      hashSeed = hash;
      mainBloom.clear();
      fillMainBloom();
      int curAcc = testSampleWords();
      std::cout << std::setw(4) << hash << std::setw(10) << curAcc << "\r\n";
      hashSeedsFile << std::setw(4) << hash << std::setw(10) << curAcc << "\r\n";
      hashSeedsFile.flush();
    }
#endif

#ifdef TEST_GRAMS_COUNT
  int from = std::atoi(appArgv[1]);
  int to = std::atoi(appArgv[2]);
  int step = std::atoi(appArgv[3]);
  std::string filename = "..\\data\\GramsSizes_" + std::string(appArgv[1]) + "_" + std::string(appArgv[2]) + "_" + std::string(appArgv[3]) + ".txt";
  std::cout << "File: " << filename.c_str() << "\r\n";
  std::fstream gramsBloomSizesFile;
  gramsBloomSizesFile.open(makeFullName(filename.c_str()), std::ios::out);
  std::cout << std::setprecision(4) << std::fixed << "Base Acc: " << baseAcc << "\r\n";
  gramsBloomSizesFile << std::setprecision(4) << std::fixed << "Base Acc: " << baseAcc << "\r\n";

  for (int size = from; size <= to; size += step)
  {
    maxGramSamplesCount = size;
    validGrams.clear();
    fillValidGrams();
    int curAcc = testSampleWords();
    std::cout << std::setw(4) << size << std::setw(10) << curAcc << "\r\n";
    gramsBloomSizesFile << std::setw(4) << size << std::setw(10) << curAcc << "\r\n";
    gramsBloomSizesFile.flush();
  }
#endif

#ifdef TEST_CONS_GRAMS_COUNT
  int from = std::atoi(appArgv[1]);
  int to = std::atoi(appArgv[2]);
  int step = std::atoi(appArgv[3]);
  std::string filename = "..\\data\\ConsGramsSizes_" + std::string(appArgv[1]) + "_" + std::string(appArgv[2]) + "_" + std::string(appArgv[3]) + ".txt";
  std::cout << "File: " << filename.c_str() << "\r\n";
  std::fstream consGramSizesFile;
  consGramSizesFile.open(makeFullName(filename.c_str()), std::ios::out);
  std::cout << std::setprecision(4) << std::fixed << "Base Acc: " << baseAcc << "\r\n";
  consGramSizesFile << std::setprecision(4) << std::fixed << "Base Acc: " << baseAcc << "\r\n";

  for (int size = from; size <= to; size += step)
  {
    maxConsonantSamplesCount = size;
    validMultiCons.clear();
    fillMultiConsGrams();
    int curAcc = testSampleWords();
    std::cout << std::setw(4) << size << std::setw(10) << curAcc << "\r\n";
    consGramSizesFile << std::setw(4) << size << std::setw(10) << curAcc << "\r\n";
    consGramSizesFile.flush();
  }
#endif

#ifdef SHOW_DEBUG_COUNTERS
  std::cout << " c0=" << c0;
  std::cout << " c1=" << c1;
  std::cout << " c2=" << c2;
  std::cout << " c3=" << c3;
  std::cout << " c4=" << c4;
  std::cout << " c5=" << c5;
  std::cout << " c6=" << c6;
  std::cout << " c7=" << c7;
  std::cout << " c8=" << c8;
  std::cout << " c9=" << c9;
  std::cout << "\r\n";
#endif

  wait();
  return baseAcc;
}
