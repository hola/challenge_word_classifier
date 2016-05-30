#include "tree_file_strength.h"
#include "file_utils.h"
#include <fstream>
#include <iostream>
#include <cstring>
#include "converter.h"
#include "settings.h"

#include "logger.h"
#include <string>

template <unsigned int n> std::mutex TreeFileStrength<n>::sMutex;

template <unsigned int n> TreeFileStrength<n>::TreeFileStrength()
{
  reset();
}

template <unsigned int n> TreeFileStrength<n>::~TreeFileStrength()
{

}

template <unsigned int n> bool TreeFileStrength<n>::analyze(const std::string & inFilename, int inNormalization)
{
  reset();
  std::ifstream _file;
  sMutex.lock();
  if(FileUtils::open(inFilename, std::ios_base::in | std::ios_base::ate, _file))
  {
    unsigned int _totals[27];
    std::memset(&_totals[0], 0, 27*sizeof(unsigned int));
    std::streampos _size = _file.tellg(); // Get size
    _file.seekg(0, std::ios_base::beg); // Go back to beginning
    std::streampos _currentPos;
    char _c[n];
    unsigned int _v;
    unsigned int _index;
    while((_currentPos = _file.tellg()) < _size-n)
    {
      _file.read(&_c[0],  n);

      if(_currentPos % 10000 == 0)
      {
        LOG(std::to_string(((1.f*_currentPos)/_size) * 100) << "%");
      }
      bool _valid(true); // Ensure it doesn't contain the new line character
      for(int _i(0); _i < n && _valid; _i++)
      {
        _valid = _valid && _c[_i] != '\n';
      }
      if(_valid)
      {
        if(getIndex(&_c[0], _index))
        {
          mData[_index]++;
          Converter::fromChar(_c[0],_v);
          _totals[_v]++;
        }
      }
      _file.seekg(_currentPos + 1, std::ios_base::beg); // Go back to the location in question
    }
    _file.close();



    //NORMALIZE
    if(inNormalization > 0)
    {
      for(int _i(0); _i < std::pow(27, n); _i++)
      {
        mData[_i] = (unsigned int) (((1.0 * mData[_i])/_totals[(unsigned int) (_i/std::pow(27, n-1))]) * inNormalization);
      }
    }
  }
  else
  {
    std::cerr << "Failed to open file: " << inFilename << std::endl;
  }
  sMutex.unlock();
}

template <unsigned int n> bool TreeFileStrength<n>::read(const std::string & inFilename)
{

}

template <unsigned int n> void TreeFileStrength<n>::reset()
{
  std::memset(&mData[0], 0, sizeof(unsigned int) * pow(27, n));
}

template <unsigned int n> bool TreeFileStrength<n>::write(const std::string & inFilename) const
{
  std::ofstream _file;
  if(FileUtils::open(inFilename, std::ios_base::out | std::ios_base::binary | std::ios_base::trunc, _file))
  {
    for(int _i(0); _i < std::pow(27, n); _i++)
    {
      _file.write((char*) FileUtils::toBin(mData[_i], 2), 2);
    }
    _file.close();
  }
  else
  {
    std::cerr << "Failed to open file: " << inFilename << std::endl;
  }
}

template <unsigned int n> bool TreeFileStrength<n>::writeToCSV(const std::string & inFilename) const
{
  std::ofstream _file;
  if(FileUtils::open(inFilename, std::ios_base::out | std::ios_base::trunc, _file))
  {
    for(int _i(0); _i < std::pow(27, n); _i++)
    {
      std::vector<char> _chars(getChars(_i));
      for(int _charIdx(0); _charIdx < n; _charIdx++)
      {
        _file << _chars.at(_charIdx);
        _file << ", ";
      }
      _file << mData[_i] << "\n";
    }
    _file.close();
  }
  else
  {
    std::cerr << "Failed to open file: " << inFilename << std::endl;
  }
}

template <unsigned int n> void TreeFileStrength<n>::generateDummyValues()
{
  int _v(0);
  for(int _i(0); _i < std::pow(27, n); _i++)
  {
    mData[_i] = _v++%1000;
  }
}


template <unsigned int n> bool TreeFileStrength<n>::getIndex(char * inChars, unsigned int & outIndex) const
{
  return Converter::getIndex(n, inChars, outIndex);
}

template <unsigned int n> std::vector<char> TreeFileStrength<n>::getChars(int inIndex) const
{
  return Converter::getChars(n, inIndex);
}

template <unsigned int n> const unsigned int * TreeFileStrength<n>::getData() const
{
  return &mData[0];
}

