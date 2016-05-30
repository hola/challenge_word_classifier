#include "character_occurence_analyzer.h"
#include "file_utils.h"
#include "logger.h"
#include <algorithm>
#include "converter.h"
#include <iostream>
#include <string>

CharacterOccurenceAnalyzer::CharacterOccurenceAnalyzer()
{

}

CharacterOccurenceAnalyzer::~CharacterOccurenceAnalyzer()
{

}

bool CharacterOccurenceAnalyzer::analyze(const std::string & inFilename)
{
  mMaxRatios.clear();
  mWords.clear();

  std::ifstream _file;
  if(FileUtils::open(inFilename, std::ios_base::in | std::ios_base::ate, _file))
  {
    std::string _currentWord;
    std::vector<std::string> _allWords;
    std::streampos _size = _file.tellg(); // Get size
    std::streampos _currentPos; // Get size
    _file.seekg(0, std::ios_base::beg); // Go back to beginning
    unsigned int _wordLength;
    std::map<char, double> _ratios;
    char _c;
    while((_currentPos = _file.tellg()) < _size)
    {
      if(_currentPos % 10000 == 0)
      {
        LOG(std::to_string(((1.f*_currentPos)/_size) * 100) << "%");
      }
      _file.read(&_c,  1);

      if(_c == '\n')
      {
        if(_wordLength > 4)
        {
          for(auto _it(_ratios.begin()); _it != _ratios.end(); _it++)
          {
            _c = Converter::toLowerCase(_it->first);
            _it->second /= _wordLength;
            mMeanRatios[_c] += _it->second;
            mAllRatios[_c].push_back(_it->second);
            mWordCount[_c]++;
            if(_it->second < 1 && _it->second > mMaxRatios[_c])
            {
              mMaxRatios[_c] = _it->second;
              mWords[_c] = _currentWord;
            }
          }
        }
        _ratios.clear();
        _wordLength = 0;
        _allWords.push_back(_currentWord);
        _currentWord.clear();
      }
      else
      {
        _c = Converter::toLowerCase(_c);
        _ratios[_c]++;
        ++_wordLength;
        _currentWord += _c;
      }
    }
    _file.close();

    // Generate mean
    for(auto _it(mMeanRatios.begin()); _it != mMeanRatios.end(); _it++)
    {
      _it->second /= mWordCount[_it->first];
    }

    // Generate standard deviations
    for(auto _it(mAllRatios.begin()); _it != mAllRatios.end(); _it++)
    {
      _c = _it->first;
      std::vector<double> & _allRatios(_it->second);
      double _sum(0);
      double _mean(mMeanRatios[_c]);
      for(auto _it2(_allRatios.begin()); _it2 != _allRatios.end(); _it2++)
      {
        _sum += pow(*_it2-_mean,2);
      }

      mSDRatios[_c] = std::sqrt(_sum/_allRatios.size());
    }
  }
  else
  {
    std::cerr << "Failed to open file: " << inFilename << std::endl;
  }
}

bool CharacterOccurenceAnalyzer::write(const std::string & inFilename, Type inType)
{
  std::ofstream _file;
  if(FileUtils::open(inFilename, std::ios_base::out | std::ios_base::binary | std::ios_base::trunc, _file))
  {
    char _correspondingChar;
    for(unsigned int _i(0); _i < 27; _i++)
    {
      Converter::fromValue(_i, _correspondingChar);
      double _value;

      if(inType == _MAX)
        _value = mMaxRatios[_correspondingChar];
      else if(inType == _MEAN)
        _value = mMeanRatios[_correspondingChar];
      else if(inType == _SD)
        _value = mMeanRatios[_correspondingChar] + mSDRatios[_correspondingChar];
      else if(inType == _2SD)
        _value = mMeanRatios[_correspondingChar] + 2*mSDRatios[_correspondingChar];
      else if(inType == _3SD)
        _value = mMeanRatios[_correspondingChar] + 3*mSDRatios[_correspondingChar];
      else if(inType == _4SD)
        _value = mMeanRatios[_correspondingChar] + 4*mSDRatios[_correspondingChar];
      else if(inType == _5SD)
        _value = mMeanRatios[_correspondingChar] + 5*mSDRatios[_correspondingChar];
      else if(inType == _6SD)
        _value = mMeanRatios[_correspondingChar] + 6*mSDRatios[_correspondingChar];

      _file.write((char*) FileUtils::toBin((unsigned int) (_value*255), 1), 1);

    }
    _file.close();
  }
  else
  {
    std::cerr << "Failed to open file: " << inFilename << std::endl;
  }
}

bool CharacterOccurenceAnalyzer::writeToCSV(const std::string & inFilename, Type inType)
{
  std::ofstream _file;
  if(FileUtils::open(inFilename, std::ios_base::out | std::ios_base::trunc, _file))
  {
    char _correspondingChar;
    for(unsigned int _i(0); _i < 27; _i++)
    {
      Converter::fromValue(_i, _correspondingChar);

      double _value;
      if(inType == _MAX)
        _value = mMaxRatios[_correspondingChar];
      else if(inType == _MEAN)
        _value = mMeanRatios[_correspondingChar];
      else if(inType == _SD)
        _value = mMeanRatios[_correspondingChar] + mSDRatios[_correspondingChar];
      else if(inType == _2SD)
        _value = mMeanRatios[_correspondingChar] + 2*mSDRatios[_correspondingChar];
      else if(inType == _3SD)
        _value = mMeanRatios[_correspondingChar] + 3*mSDRatios[_correspondingChar];
      else if(inType == _4SD)
        _value = mMeanRatios[_correspondingChar] + 4*mSDRatios[_correspondingChar];
      else if(inType == _5SD)
        _value = mMeanRatios[_correspondingChar] + 5*mSDRatios[_correspondingChar];
      else if(inType == _6SD)
        _value = mMeanRatios[_correspondingChar] + 6*mSDRatios[_correspondingChar];

      _file << _correspondingChar << ", " << std::to_string((unsigned int) (_value*255)) << '\n';
    }
    _file.close();
  }
  else
  {
    std::cerr << "Failed to open file: " << inFilename << std::endl;
  }
}
