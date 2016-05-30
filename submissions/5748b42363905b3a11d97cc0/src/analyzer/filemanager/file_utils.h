#pragma once


#include <vector>
#include <string>
#include <fstream>

#include <set>

class FileUtils
{
public:
  static unsigned char* toBin(unsigned int value, int n_bytes = 4);
  static unsigned char* toBin(float value, int n_bytes = 4);

  static std::set<char> getVowels();

  static int readInt32(unsigned char * data, int n_bytes = 4);
  static float readFloat32(unsigned char * data, int n_bytes = 4);

  static void insertPadding(unsigned char * data, int from, int to);

  static bool open(const std::string & inFilename, std::ios_base::openmode inOpenMode, std::ifstream & outFile);
  static bool open(const std::string & inFilename, std::ios_base::openmode inOpenMode, std::ofstream & outFile);

  static bool getStatistics(const std::string & inFilename, int & outMaxLength, std::string & outLongestWord,
  double & outMeanLength, double & outSD);

  static bool getVowelStatistics(const std::string & inFilename, double & outMeanVowelRatio, double & outVowelSD);

  std::string getLongestWord(const std::string & inFilename, int & inLength);

  static const std::set<char> sVowels;
  static bool dirExists(const char *path);

};

