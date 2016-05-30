#include "endings_analyzer.h"
#include "logger.h"
#include <string>

template <unsigned int n> EndingAnalyzer<n>::EndingAnalyzer()
{

}

template <unsigned int n> EndingAnalyzer<n>::~EndingAnalyzer()
{

}

template <unsigned int n> bool EndingAnalyzer<n>::analyze(const std::string & inFilename, int inNormalization)
{
  this->reset();
  std::ifstream _file;
  if(FileUtils::open(inFilename, std::ios_base::in | std::ios_base::ate, _file))
  {
    std::streampos _size = _file.tellg(); // Get size
    _file.seekg(0, std::ios_base::beg); // Go back to beginning
    std::streampos _currentPos;
    std::string _currentWord;
    char _c;
    char _lastNChars[n];
    unsigned int _index;
    while((_currentPos = _file.tellg()) < _size-n)
    {
      if(_currentPos % 10000 == 0)
      {
        LOG(std::to_string(((1.f*_currentPos)/_size) * 100) << "%");
      }
      _file.read(&_c,  1);

      if(_c == '\n')
      {
        if(_currentWord.length() >= n)
        {
          for(int _i(0); _i < n; _i++)
          {
            _lastNChars[_i] = _currentWord.at(_currentWord.length()-n+_i);
          }
          if(this->getIndex(_lastNChars, _index))
          {
            this->mData[_index]++;
          }
        }
        _currentWord.clear();
      }
      else
      {
        _currentWord += _c;
      }
    }
    _file.close();
  }
  else
  {
    std::cerr << "Failed to open file: " << inFilename << std::endl;
  }
}
