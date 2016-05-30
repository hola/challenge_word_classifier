#pragma once

#include <string>
#include <map>
#include <vector>

class CharacterOccurenceAnalyzer
{
public:
  enum Type{
    _MAX,
    _MEAN,
    _SD,
    _2SD,
    _3SD,
    _4SD,
    _5SD,
    _6SD
  };

  CharacterOccurenceAnalyzer();
  ~CharacterOccurenceAnalyzer();

  bool analyze(const std::string & inFilename);

  bool write(const std::string & inFilename, Type inType);

  bool writeToCSV(const std::string & inFilename, Type inType);

private:
  std::map<char, double> mMaxRatios;
  std::map<char, double> mMeanRatios;
  std::map<char, double> mSDRatios;
  std::map<char, std::vector<double>> mAllRatios;
  std::map<char, unsigned int> mWordCount;
//  std::map<char, double> mRatios;
  std::map<char, std::string> mWords;

};
